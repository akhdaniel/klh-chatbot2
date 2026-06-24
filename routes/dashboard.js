/**
 * Dashboard routes — Dashboard statistics and KPIs
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── Get dashboard KPIs ───────────────────────────────────────── */
router.get('/kpis', async (req, res) => {
  try {
    // Get total tickets
    const tickets = await pg.list('tickets', { limit: 1000 });
    const totalTickets = tickets.length;
    
    // Get tickets by status
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const closedTickets = tickets.filter(t => t.status === 'closed').length;
    
    // Get tickets by priority
    const highPriorityTickets = tickets.filter(t => t.priority === 'high').length;
    
    // Get recent tickets (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTickets = tickets.filter(t => {
      const createdDate = new Date(t.created_at);
      return createdDate >= sevenDaysAgo;
    }).length;
    
    // Get total customers
    const customers = await pg.list('users', { limit: 1000 });
    const totalCustomers = customers.length;
    
    res.json({
      ok: true,
      data: {
        tickets: {
          total: totalTickets,
          open: openTickets,
          in_progress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
          high_priority: highPriorityTickets,
          recent_7d: recentTickets,
        },
        customers: {
          total: totalCustomers,
        },
      },
    });
  } catch (err) {
    console.error('[dashboard/kpis]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get recent activity ──────────────────────────────────────── */
router.get('/activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent tickets
    const tickets = await pg.list('tickets', {
      limit: parseInt(limit),
      order: 'created_at.desc',
    });
    
    res.json({
      ok: true,
      data: tickets.map(t => ({
        id: t.id,
        type: 'ticket',
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
      })),
    });
  } catch (err) {
    console.error('[dashboard/activity]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
