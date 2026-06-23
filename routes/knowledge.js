/**
 * Knowledge base routes — manage chatbot knowledge documents
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── List documents ───────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, search } = req.query;
    const filters = {};
    if (category) filters.category = category;

    let docs;
    if (search) {
      docs = await pg.list('knowledge_docs', {
        select: '*',
        order: 'updated_at.desc',
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: { ...filters, 'or': `(title.il.*${search}*,content.il.*${search}*)` },
      });
    } else {
      docs = await pg.list('knowledge_docs', {
        select: '*',
        order: 'updated_at.desc',
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters,
      });
    }

    const countRes = await pg.client.get('/knowledge_docs?select=count');
    const total = parseInt(countRes.data?.[0]?.count || 0);

    res.json({ ok: true, data: docs, total });
  } catch (err) {
    console.error('[knowledge/list]', err.message);
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

/* ── Create document ──────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { title, content, category, source } = req.body;
    if (!title || !content) {
      return res.status(400).json({ ok: false, error: 'title and content are required' });
    }

    const result = await pg.insert('knowledge_docs', {
      title, content, category: category || 'general',
      source: source || null,
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
    await pg.delete('knowledge_docs', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[knowledge/delete]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
