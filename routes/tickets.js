/**
 * Tickets routes — Helpdesk ticket management
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── List tickets ────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, priority, assignee } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignee) filters.assignee_id = assignee;
    
    const tickets = await pg.list('tickets', {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: 'created_at.desc',
    });
    
    res.json({ ok: true, data: tickets });
  } catch (err) {
    console.error('[tickets/list]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get single ticket ───────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await pg.get('tickets', req.params.id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket not found' });
    }
    res.json({ ok: true, data: ticket });
  } catch (err) {
    console.error('[tickets/get]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Create ticket ──────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { subject, description, priority = 'medium', customer_id } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({ ok: false, error: 'Subject and description required' });
    }
    
    const ticket = await pg.insert('tickets', {
      subject,
      description,
      priority,
      customer_id,
      status: 'open',
      created_at: new Date().toISOString(),
    });
    
    res.status(201).json({ ok: true, data: ticket });
  } catch (err) {
    console.error('[tickets/create]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Update ticket ──────────────────────────────────────────── */
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const ticket = await pg.update('tickets', req.params.id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    res.json({ ok: true, data: ticket });
  } catch (err) {
    console.error('[tickets/update]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Delete ticket ──────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    await pg.delete('tickets', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[tickets/delete]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
