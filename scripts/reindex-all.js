#!/usr/bin/env node
/**
 * Re-index all knowledge documents
 * Re-extracts text from all files and updates database
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const POSTGREST_URL = 'http://127.0.0.1:4001';
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

async function extractText(filePath, fileType) {
  try {
    const ext = fileType.toLowerCase();
    
    if (ext === 'pdf') {
      return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on('pdfParser_dataError', errData => {
          console.error('[extractText] PDF parse error:', errData.parserError);
          resolve('[Error parsing PDF: ' + (errData.parserError?.message || 'Unknown error') + ']');
        });
        
        pdfParser.on('pdfParser_dataReady', pdfData => {
          try {
            let text = '';
            if (pdfData.Pages && pdfData.Pages.length > 0) {
              for (const page of pdfData.Pages) {
                if (page.Texts && page.Texts.length > 0) {
                  for (const textItem of page.Texts) {
                    if (textItem.R && textItem.R.length > 0) {
                      for (const r of textItem.R) {
                        if (r.T) {
                          // URL decode the text
                          try {
                            text += decodeURIComponent(r.T) + ' ';
                          } catch (e) {
                            text += r.T + ' ';
                          }
                        }
                      }
                    }
                  }
                  text += '\n';
                }
              }
            }
            resolve(text.trim() || '[No text content found in PDF]');
          } catch (err) {
            console.error('[extractText] Error processing PDF data:', err);
            resolve('[Error processing PDF: ' + err.message + ']');
          }
        });
        
        pdfParser.loadPDF(filePath);
      });
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
    console.error(`[extractText] Error for ${filePath}:`, err.message);
    return `[Error extracting content: ${err.message}]`;
  }
}

async function getAllDocs() {
  const res = await axios.get(`${POSTGREST_URL}/knowledge_docs`, {
    params: { order: 'id.desc' }
  });
  return res.data;
}

async function updateDoc(id, content, status = 'indexed') {
  await axios.patch(`${POSTGREST_URL}/knowledge_docs`, {
    content,
    status,
    updated_at: new Date().toISOString()
  }, {
    params: { id: `eq.${id}` }
  });
}

async function reindexAll() {
  console.log('[reindex] Fetching all documents...\n');
  
  const docs = await getAllDocs();
  console.log(`[reindex] Found ${docs.length} documents\n`);
  
  for (const doc of docs) {
    console.log(`[reindex] Processing: ${doc.title} (id=${doc.id})`);
    console.log(`[reindex]   File: ${doc.file_path}`);
    
    // Check if file exists
    if (!doc.file_path || !fs.existsSync(doc.file_path)) {
      console.log(`[reindex]   ⚠️  File not found, skipping\n`);
      continue;
    }
    
    try {
      // Extract text
      console.log(`[reindex]   Extracting text...`);
      const content = await extractText(doc.file_path, doc.file_type);
      console.log(`[reindex]   Extracted ${content.length} chars`);
      
      // Update database
      await updateDoc(doc.id, content, 'indexed');
      console.log(`[reindex]   ✅ Updated database\n`);
      
    } catch (err) {
      console.error(`[reindex]   ❌ Error: ${err.message}\n`);
    }
  }
  
  console.log('[reindex] Done!');
}

reindexAll().catch(err => {
  console.error('[reindex] Fatal error:', err);
  process.exit(1);
});
