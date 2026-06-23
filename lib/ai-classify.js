/**
 * AI-powered message classification
 * Uses OpenAI-compatible API (DeepSeek, Gemini, OpenAI, etc.)
 * Falls back to keyword-based if no API key configured.
 */

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat';

const TICKET_KEYWORDS = [
  'komplain', 'keluhan', 'kecewa', 'buruk', 'gagal', 'tidak puas',
  'rusak', 'error', 'masalah', 'salah', 'batal',
  'urgent', 'darurat', 'mendesak', 'tolong segera', 'cepat',
  'bug', 'crash', 'not working', 'tidak berfungsi',
  'server down', 'offline', 'tidak bisa akses', 'lapor',
  'pengaduan', 'tindak lanjut', 'follow up',
];

async function classifyKeyword(message) {
  const lower = (message || '').toLowerCase();
  const matched = TICKET_KEYWORDS.filter(k => lower.includes(k));
  const isUrgent = ['urgent','darurat','mendesak','critical','sekarang juga'].some(k => lower.includes(k));

  let label = 'normal';
  let confidence = 0.1;

  if (isUrgent) { label = 'urgent'; confidence = 0.85; }
  else if (matched.length >= 2) { label = 'needs_ticket'; confidence = 0.7; }
  else if (matched.length === 1) { label = 'needs_ticket'; confidence = 0.5; }

  return { label, confidence, urgent: isUrgent, matched_keywords: matched };
}

async function classifyAI(message, context = {}) {
  const system = `Kamu adalah classifier untuk aplikasi customer service Kementerian Lingkungan Hidup (KLH).
Tugasmu: tentukan apakah pesan customer perlu dibuatkan tiket atau tidak.

Kriteria BUTUH TIKET:
- Keluhan / komplain / pengaduan
- Laporan masalah teknis
- Permintaan urgent / darurat
- Pertanyaan yang butuh investigasi lanjutan
- Follow-up permintaan sebelumnya
- Eskalasi

Kriteria TIDAK BUTUH TIKET (jawab bot aja):
- Sapaan / salam
- Pertanyaan umum (jam buka, alamat, dll)
- Informasi yang sudah ada di FAQ/knowledge base
- Percakapan biasa / small talk

RESPON FORMAT JSON:
{
  "classification": "normal" | "needs_ticket" | "urgent",
  "confidence": 0.0 - 1.0,
  "reason": "alasan singkat bahasa Indonesia",
  "suggested_subject": "judul tiket (jika needs_ticket/urgent)"
}`;

  const userMsg = `Pesan: "${message}"${context.customer_name ? `\nNama: ${context.customer_name}` : ''}${context.phone ? `\nNo: ${context.phone}` : ''}`;

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.1,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  
  // Parse JSON from AI response (handle markdown-wrapped json)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response not valid JSON: ' + text.substring(0, 100));
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Main classify function — AI first, fallback to keyword
 */
async function classify(message, context = {}) {
  if (!message || !message.trim()) {
    return { classification: 'normal', confidence: 1, reason: 'Empty message' };
  }

  // Try AI
  if (AI_API_KEY) {
    try {
      const result = await classifyAI(message, context);
      return {
        classification: result.classification || 'normal',
        confidence: result.confidence || 0.5,
        reason: result.reason || '',
        suggested_subject: result.suggested_subject || null,
        source: 'ai',
      };
    } catch (err) {
      console.error('[AI-classify] API failed, falling back to keyword:', err.message);
      // Fall through to keyword
    }
  }

  // Fallback: keyword-based
  const kw = await classifyKeyword(message);
  return {
    classification: kw.label,
    confidence: kw.confidence,
    reason: kw.matched_keywords.length
      ? `Keyword match: ${kw.matched_keywords.join(', ')}`
      : 'No ticket keywords detected',
    suggested_subject: null,
    source: 'keyword',
  };
}

module.exports = { classify, classifyKeyword, classifyAI };
