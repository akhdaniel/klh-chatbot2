/**
 * Customers routes — CRUD for chatbot customers
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── List customers ───────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, platform } = req.query;
    const filters = {};
    if (platform) filters.platform = platform;

    let customers;
    if (search) {
      customers = await pg.list('customers', {
        select: '*',
        order: 'last_seen.desc',
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: { ...filters, 'or': `(name.il.*${search}*,phone.il.*${search}*)` },
      });
    } else {
      customers = await pg.list('customers', {
        select: '*',
        order: 'last_seen.desc',
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters,
      });
    }

    const countRes = await pg.client.get('/customers?select=count');
    const total = parseInt(countRes.data?.[0]?.count || 0);

    res.json({ ok: true, data: customers, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error('[customers/list]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get single customer ──────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const customer = await pg.get('customers', req.params.id);
    if (!customer) return res.status(404).json({ ok: false, error: 'not found' });

    // Get their conversations
    const conversations = await pg.list('conversations', {
      select: 'id,status,unread_count,last_message_at,created_at',
      order: 'last_message_at.desc',
      filters: { customer_id: req.params.id },
    });

    res.json({ ok: true, data: { ...customer, conversations } });
  } catch (err) {
    console.error('[customers/get]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Update customer ──────────────────────────────────────────── */
router.patch('/:id', async (req, res) => {
  try {
    const { name, avatar, notes, tags, is_blocked } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (notes !== undefined) updates.notes = notes;
    if (tags !== undefined) updates.tags = tags;
    if (is_blocked !== undefined) updates.is_blocked = is_blocked;

    await pg.update('customers', req.params.id, updates);
    res.json({ ok: true });
  } catch (err) {
    console.error('[customers/update]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Delete customer ──────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    await pg.delete('customers', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[customers/delete]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
