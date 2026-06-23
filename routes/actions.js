/**
 * Actions routes — business logic & operations layer
 * BFF bukan cuma CRUD, tapi juga action endpoints.
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── Keyword rules for ticket classification ──────────────────── */
const TICKET_KEYWORDS = [
  // Keluhan / komplain
  'komplain', 'keluhan', 'kecewa', 'buruk', 'gagal', 'tidak puas',
  'rusak', 'error', 'masalah', 'salah', 'batal',
  // Emergency / urgent
  'urgent', 'darurat', 'mendesak', 'tolong segera', 'cepat',
  // Teknis
  'error', 'bug', 'crash', 'not working', 'tidak berfungsi',
  'server down', 'offline', 'tidak bisa akses',
  // Layanan
  'lapor', 'pengaduan', 'tindak lanjut', 'follow up',
  // Pertanyaan butuh investigasi
  'kenapa', 'bagaimana cara', 'kapan',
];

const URGENT_KEYWORDS = [
  'urgent', 'darurat', 'mendesak', 'sekarang juga', 'critical',
  'kebakaran', 'kehilangan', 'darurat',
];

/* ── Classify message → ticket ────────────────────────────────── */
router.post('/classify-message', async (req, res) => {
  try {
    const { message_id, message_text, conversation_id, customer_id, phone } = req.body;
    let content = message_text || '';
    let customerId = customer_id || null;
    let convId = conversation_id || null;
    let msgId = message_id || null;

    // If only message_id provided, fetch from DB
    if (message_id && !content) {
      const msg = await pg.get('messages', message_id);
      if (!msg) return res.status(404).json({ ok: false, error: 'message not found' });
      content = msg.content || msg.text || '';
      customerId = customerId || msg.customer_id;
      convId = convId || msg.conversation_id;
      msgId = message_id;
    }

    if (!content) {
      return res.status(400).json({ ok: false, error: 'no message content to classify' });
    }

    const lower = content.toLowerCase();

    /* ── Classification ────────────────────────────────────── */
    const isUrgent = URGENT_KEYWORDS.some(k => lower.includes(k));
    const isTicketWorthy = TICKET_KEYWORDS.some(k => lower.includes(k));
    const confidence = isUrgent ? 0.9 : isTicketWorthy ? 0.6 : 0.1;

    let classification = 'normal';
    if (isUrgent) classification = 'urgent';
    else if (isTicketWorthy) classification = 'needs_ticket';

    let ticket = null;

    /* ── Auto-create ticket if needed ──────────────────────── */
    if (classification !== 'normal' && customerId) {
      // Get customer info
      const customer = await pg.get('customers', customerId);

      // Create ticket
      const subject = content.length > 100
        ? content.substring(0, 97) + '...'
        : content;

      const ticketResult = await pg.insert('tickets', {
        customer_id: customerId,
        subject: subject,
        status: 'open',
        priority: isUrgent ? 'urgent' : 'medium',
        created_at: new Date().toISOString(),
      });

      ticket = Array.isArray(ticketResult) ? ticketResult[0] : ticketResult;

      // Link message to ticket
      if (msgId && ticket?.id) {
        await pg.update('messages', msgId, {
          ticket_id: ticket.id,
          classification: classification,
        });
      }

      // Log to ticket_history
      await pg.insert('ticket_history', {
        ticket_id: ticket?.id || 0,
        status: 'open',
        notes: `Ticket auto-created from chat: ${content.substring(0, 200)}`,
        created_at: new Date().toISOString(),
      });
    }

    res.json({
      ok: true,
      classification: {
        label: classification,
        confidence: confidence,
        urgent: isUrgent,
        ticket_worthy: isTicketWorthy,
        matched_keywords: TICKET_KEYWORDS.filter(k => lower.includes(k)),
      },
      ticket: ticket || null,
      message_id: msgId,
    });
  } catch (err) {
    console.error('[actions/classify]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Send WhatsApp message via OpenClaw ───────────────────────── */
router.post('/send-whatsapp', async (req, res) => {
  try {
    const { phone, message, conversation_id } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ ok: false, error: 'phone and message required' });
    }

    // We'll integrate with OpenClaw's send API later
    // For now, save to messages table via PostgREST
    const result = await pg.rpc('chat_save', {
      p_phone: phone,
      p_message: message,
      p_sender_type: 'staff',
      p_platform: 'whatsapp',
    });

    res.json({
      ok: true,
      action: 'send-whatsapp',
      sent: true,
      data: result,
      note: 'Message saved. OpenClaw integration pending.',
    });
  } catch (err) {
    console.error('[actions/send-whatsapp]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Resolve ticket ───────────────────────────────────────────── */
router.post('/resolve-ticket', async (req, res) => {
  try {
    const { ticket_id, resolution_notes, resolved_by } = req.body;
    if (!ticket_id) return res.status(400).json({ ok: false, error: 'ticket_id required' });

    await pg.update('tickets', ticket_id, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: resolved_by || null,
    });

    await pg.insert('ticket_history', {
      ticket_id,
      status: 'resolved',
      notes: resolution_notes || 'Resolved',
      created_at: new Date().toISOString(),
    });

    res.json({ ok: true, action: 'resolve-ticket', ticket_id });
  } catch (err) {
    console.error('[actions/resolve-ticket]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Forward ticket ────────────────────────────────────────────── */
router.post('/forward-ticket', async (req, res) => {
  try {
    const { ticket_id, assigned_to, notes } = req.body;
    if (!ticket_id || !assigned_to) {
      return res.status(400).json({ ok: false, error: 'ticket_id and assigned_to required' });
    }

    await pg.update('tickets', ticket_id, {
      assigned_to,
      status: 'in_progress',
    });

    await pg.insert('ticket_history', {
      ticket_id,
      status: 'in_progress',
      notes: notes || `Forwarded to ${assigned_to}`,
      created_at: new Date().toISOString(),
    });

    res.json({ ok: true, action: 'forward-ticket', ticket_id, assigned_to });
  } catch (err) {
    console.error('[actions/forward-ticket]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
