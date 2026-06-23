/**
 * Chat routes — message CRUD, history, and send
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── Save a chat message ────────────────────────────────────── */
router.post('/save', async (req, res) => {
  try {
    const {
      phone, message, sender_type = 'customer',
      platform = 'whatsapp', name = null,
    } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ ok: false, error: 'phone and message are required' });
    }

    const result = await pg.saveChat(phone, message, sender_type, platform, name);
    res.json(result);
  } catch (err) {
    console.error('[chat/save]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get conversation list ───────────────────────────────────── */
router.get('/conversations', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, platform } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (platform) filters.platform = platform;

    // Get conversations with customer info via embedded filter
    const conversations = await pg.list('conversations', {
      select: '*,customer:customer_id(id,phone,name,avatar)',
      order: 'last_message_at.desc',
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters,
    });

    // Get latest message for each conversation
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        try {
          const msgs = await pg.list('messages', {
            select: 'id,content,sender_type,created_at',
            order: 'created_at.desc',
            limit: 1,
            filters: { conversation_id: conv.id },
          });
          conv.last_message = msgs[0] || null;
        } catch { conv.last_message = null; }
        return conv;
      })
    );

    // Get total count
    let countUrl = `/conversations?select=count`;
    if (status) countUrl += `&status=eq.${status}`;
    if (platform) countUrl += `&platform=eq.${platform}`;

    const countRes = await pg.client.get(countUrl);
    const total = parseInt(countRes.data?.[0]?.count || 0);

    res.json({ ok: true, data: enriched, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error('[chat/conversations]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get message history for a conversation ──────────────────── */
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const messages = await pg.list('messages', {
      select: 'id,conversation_id,customer_id,phone,sender_type,role,content,platform,is_read,created_at',
      order: 'created_at.desc',
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { conversation_id: conversationId },
    });

    // Get conversation info
    const conversation = await pg.get('conversations', conversationId);

    res.json({ ok: true, data: messages.reverse(), conversation });
  } catch (err) {
    console.error('[chat/history]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Mark messages as read ──────────────────────────────────── */
router.patch('/read/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    await pg.update('messages', conversationId, { is_read: true }, 'conversation_id');
    await pg.update('conversations', conversationId, { unread_count: 0 });

    res.json({ ok: true });
  } catch (err) {
    console.error('[chat/read]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Search messages ──────────────────────────────────────────── */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ ok: false, error: 'query required' });

    // PostgREST supports full-text search with `fts` filter
    const messages = await pg.list('messages', {
      select: 'id,conversation_id,phone,content,sender_type,created_at',
      order: 'created_at.desc',
      limit: parseInt(limit),
      filters: { 'content': `fts.${q}` },
    });

    res.json({ ok: true, data: messages });
  } catch (err) {
    console.error('[chat/search]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
