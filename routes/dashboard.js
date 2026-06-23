/**
 * Dashboard routes — statistics and overview
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── Main dashboard stats ─────────────────────────────────────── */
router.get('/stats', async (req, res) => {
  try {
    const { period = 'today' } = req.query;

    // Total customers count
    const customerCount = await pg.client.get('/customers?select=count');
    const totalCustomers = parseInt(customerCount.data?.[0]?.count || 0);

    // Active conversations
    const activeConvs = await pg.client.get('/conversations?select=count&status=eq.active');
    const activeConversations = parseInt(activeConvs.data?.[0]?.count || 0);

    // Total messages
    const msgCount = await pg.client.get('/messages?select=count');
    const totalMessages = parseInt(msgCount.data?.[0]?.count || 0);

    // Unread messages
    const unreadMsgs = await pg.client.get('/messages?select=count&is_read=eq.false&sender_type=eq.customer');
    const unreadMessages = parseInt(unreadMsgs.data?.[0]?.count || 0);

    // Daily stats
    const today = new Date().toISOString().split('T')[0];

    let dailyStats;
    try {
      dailyStats = await pg.list('daily_stats', {
        select: '*',
        order: 'date.desc',
        limit: period === 'today' ? 1 : 30,
      });
    } catch {
      dailyStats = [];
    }

    // Customers by platform
    let customersByPlatform;
    try {
      customersByPlatform = await pg.client.get('/customers?select=platform,count&group=platform');
    } catch {
      customersByPlatform = { data: [] };
    }

    // Messages in last 7 days
    let messagesByDay;
    try {
      messagesByDay = await pg.list('daily_stats', {
        select: 'date,total_messages,customer_messages',
        order: 'date.desc',
        limit: 7,
      });
    } catch {
      messagesByDay = [];
    }

    res.json({
      ok: true,
      data: {
        totalCustomers,
        activeConversations,
        totalMessages,
        unreadMessages,
        dailyStats: dailyStats,
        customersByPlatform: customersByPlatform.data,
        messagesByDay: messagesByDay.reverse(),
      },
    });
  } catch (err) {
    console.error('[dashboard/stats]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Messages volume chart data ───────────────────────────────── */
router.get('/chart/messages', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await pg.list('daily_stats', {
      order: 'date.desc',
      limit: parseInt(days),
    });

    res.json({
      ok: true,
      data: stats.reverse(),
    });
  } catch (err) {
    console.error('[dashboard/chart]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
