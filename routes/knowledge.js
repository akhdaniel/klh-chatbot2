/**
 * Knowledge base routes — manage chatbot knowledge documents
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pg = require('../lib/postgrest');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Storage config: permanent location
const UPLOAD_DIR = '/mnt/disk2/klh-docs';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.xlsx', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type ${ext} not allowed`));
  },
});

/* ── Extract text from file ─────────────────────────────────── */
async function extractText(filePath, fileType) {
  try {
    const ext = fileType.toLowerCase();
    
    if (ext === 'pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    }
    
    if (ext === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    
    if (ext === 'txt' || ext === 'csv') {
      return fs.readFileSync(filePath, 'utf8');
    }
    
    if (ext === 'xlsx') {
      return `[Excel file: ${path.basename(filePath)}. Content extraction not implemented.]`;
    }
    
    return `[Unsupported file type: ${ext}]`;
  } catch (err) {
    console.error('[knowledge/extractText] Error:', err.message);
    return `[Error extracting content: ${err.message}]`;
  }
}

/* ── List documents ───────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, search } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (search) filters.or = `(title.il.*${search}*,content.il.*${search}*)`;

    const docs = await pg.list('knowledge_docs', {
      select: '*',
      order: 'updated_at.desc',
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    res.json({ ok: true, data: docs, total: docs.length });
  } catch (err) {
    console.error('[knowledge/list]', err.message, err.response?.data);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get single document ──────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const doc = await pg.get('knowledge_docs', req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'not found' });
    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('[knowledge/get]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Create document (manual) ─────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { title, content, category, source } = req.body;
    if (!title || !content) {
      return res.status(400).json({ ok: false, error: 'title and content are required' });
    }

    const result = await pg.insert('knowledge_docs', {
      title, 
      content, 
      category: category || 'general',
      source: source || null,
      status: 'indexed',
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    console.error('[knowledge/create]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Update document ──────────────────────────────────────────── */
router.patch('/:id', async (req, res) => {
  try {
    const { title, content, category, source } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (source !== undefined) updates.source = source;

    await pg.update('knowledge_docs', req.params.id, updates);
    res.json({ ok: true });
  } catch (err) {
    console.error('[knowledge/update]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Delete document ──────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const doc = await pg.get('knowledge_docs', req.params.id);
    if (doc && doc.file_path && fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
      console.log(`[knowledge/delete] Deleted file: ${doc.file_path}`);
    }
    
    await pg.delete('knowledge_docs', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[knowledge/delete]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Upload & Index file ─────────────────────────────────────── */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No file provided' });
    }

    const { title, category } = req.body;
    const fileType = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    
    console.log(`[knowledge/upload] Received: ${req.file.originalname} (${fileType})`);
    console.log(`[knowledge/upload] Saved to: ${req.file.path}`);

    // Extract text content
    console.log(`[knowledge/upload] Extracting text...`);
    const content = await extractText(req.file.path, fileType);
    const contentPreview = content.substring(0, 200).replace(/\s+/g, ' ');
    console.log(`[knowledge/upload] Extracted ${content.length} chars. Preview: ${contentPreview}...`);

    // Insert to database with extracted content
    const doc = await pg.insert('knowledge_docs', {
      title: title || req.file.originalname,
      category: category || 'general',
      filename: req.file.originalname,
      file_type: fileType,
      file_size: req.file.size,
      file_path: req.file.path,
      content: content,
      status: 'indexed',
    });

    console.log(`[knowledge/upload] Indexed as knowledge doc id=${doc.id}`);

    res.json({
      ok: true,
      data: {
        id: doc.id,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        title: title || req.file.originalname,
        category: category || 'general',
        status: 'indexed',
        content_length: content.length,
      },
    });
  } catch (err) {
    console.error('[knowledge/upload] Error:', err.message);
    // Clean up file if insert failed
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ── Re-index document (re-extract text) ─────────────────────── */
router.post('/:id/reindex', async (req, res) => {
  try {
    const doc = await pg.get('knowledge_docs', req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'not found' });
    
    if (!doc.file_path || !fs.existsSync(doc.file_path)) {
      return res.status(400).json({ ok: false, error: 'file not found on disk' });
    }

    console.log(`[knowledge/reindex] Re-indexing doc ${req.params.id}...`);
    const content = await extractText(doc.file_path, doc.file_type);
    
    await pg.update('knowledge_docs', req.params.id, {
      content,
      status: 'indexed',
    });

    res.json({ ok: true, content_length: content.length });
  } catch (err) {
    console.error('[knowledge/reindex]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Search knowledge (for AI agent) ─────────────────────────── */
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 3, category } = req.body;
    if (!query) {
      return res.status(400).json({ ok: false, error: 'query required' });
    }

    console.log(`[knowledge/search] Query: "${query}"`);

    // Search by title or content (case-insensitive)
    const searchTerm = query.toLowerCase();
    
    // Get all indexed docs and filter (simple approach - can be optimized with FTS)
    const filters = { status: 'indexed' };
    if (category) filters.category = category;

    const docs = await pg.list('knowledge_docs', {
      select: 'id,title,category,content,filename,updated_at',
      filters,
      limit: 100, // Get more for client-side ranking
    });

    // Simple relevance scoring: check if query words appear in title/content
    const queryWords = searchTerm.split(/\s+/).filter(w => w.length > 2);
    
    const scoredDocs = docs.map(doc => {
      const titleLower = (doc.title || '').toLowerCase();
      const contentLower = (doc.content || '').toLowerCase();
      
      let score = 0;
      
      // Title match is weighted higher
      if (titleLower.includes(searchTerm)) score += 10;
      
      // Individual word matches
      queryWords.forEach(word => {
        if (titleLower.includes(word)) score += 5;
        if (contentLower.includes(word)) score += 1;
      });
      
      // Content snippet (first 500 chars around a match, or just beginning)
      let snippet = '';
      if (doc.content) {
        const matchIndex = contentLower.indexOf(searchTerm);
        if (matchIndex >= 0) {
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(doc.content.length, matchIndex + 400);
          snippet = doc.content.substring(start, end);
        } else {
          snippet = doc.content.substring(0, 500);
        }
      }
      
      return { ...doc, score, snippet };
    });

    // Sort by score and take top N
    const results = scoredDocs
      .filter(d => d.score > 0 || queryWords.length === 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(({ score, snippet, content, ...doc }) => ({ 
        ...doc, 
        relevance_score: score,
        content_preview: snippet 
      }));

    console.log(`[knowledge/search] Found ${results.length} results`);

    res.json({ 
      ok: true, 
      query,
      results,
      total: results.length 
    });
  } catch (err) {
    console.error('[knowledge/search]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get all knowledge as context (for system prompt) ────────── */
router.get('/context/all', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    const filters = { status: 'indexed' };
    if (category) filters.category = category;

    const docs = await pg.list('knowledge_docs', {
      select: 'title,category,content',
      filters,
      limit: parseInt(limit),
      order: 'updated_at.desc',
    });

    // Format as context string for AI
    const context = docs.map(doc => {
      const content = doc.content || '';
      const preview = content.length > 1000 
        ? content.substring(0, 1000) + '... [truncated]'
        : content;
      return `[${doc.category}] ${doc.title}:\n${preview}`;
    }).join('\n\n---\n\n');

    res.json({ 
      ok: true, 
      context,
      doc_count: docs.length,
      sources: docs.map(d => ({ title: d.title, category: d.category }))
    });
  } catch (err) {
    console.error('[knowledge/context]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
