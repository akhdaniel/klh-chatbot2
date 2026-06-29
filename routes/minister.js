/**
 * Minister routes — Minister agenda management
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── List agendas with full dashboard data ───────────────────── */
router.get('/agendas', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, date_from, date_to, week_view } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (date_from) filters.agenda_date = `gte.${date_from}`;
    if (date_to) {
      if (date_from) {
        filters.agenda_date = `and(gte.${date_from},lte.${date_to})`;
      } else {
        filters.agenda_date = `lte.${date_to}`;
      }
    }
    
    // Get all agendas
    const agendas = await pg.list('agendas', {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: 'agenda_date.asc,agenda_time.asc',
    });

    // Helper function to format date
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      
      const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      return {
        day_number: date.getDate(),
        day_name: days[date.getDay()],
        month_name: months[date.getMonth()],
        year: date.getFullYear(),
        formatted: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
        iso: dateStr
      };
    };

    // Enrich agendas with formatted dates
    const enrichedAgendas = agendas.map(a => ({
      ...a,
      date_formatted: formatDate(a.agenda_date)
    }));

    // Calculate statistics
    const total = enrichedAgendas.length;
    const critical = agendas.filter(a => a.priority === 'critical').length;
    const high = agendas.filter(a => a.priority === 'high').length;
    const medium = agendas.filter(a => a.priority === 'medium').length;
    const delegate = agendas.filter(a => a.priority === 'delegate').length;
    const toAttend = agendas.filter(a => a.recommended_action === 'attend').length;
    const toDelegate = agendas.filter(a => a.recommended_action === 'delegate').length;

    // Category breakdown for sidebar
    const categories = {};
    enrichedAgendas.forEach(a => {
      const cat = a.category || 'internal';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    // Sort categories by count
    const categoryRanking = Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // AI Recommendation summary
    const criticalAgendas = enrichedAgendas.filter(a => a.priority === 'critical');
    const highAgendas = enrichedAgendas.filter(a => a.priority === 'high');
    const delegateAgendas = enrichedAgendas.filter(a => a.priority === 'delegate');

    const aiRecommendation = {
      total_invitations: total,
      analyzed: total,
      critical_count: critical,
      high_count: high,
      medium_count: medium,
      delegate_count: delegate,
      recommendation: `Dari ${total} undangan, AI menganalisis kepadatan jadwal, urgensi politik, dampak strategis, dan tujuan ESG. Rekomendasi: Bapak Menteri prioritaskan ${critical + high} agenda kritis dan delegasikan sisanya ke Eselon I atau Wamen.`,
      attend_list: criticalAgendas.slice(0, 3).map(a => ({
        id: a.id,
        title: a.title,
        date: a.agenda_date,
        reason: 'Dampak nasional & internasional tinggi'
      })),
      delegate_list: delegateAgendas.slice(0, 3).map(a => ({
        id: a.id,
        title: a.title,
        date: a.agenda_date,
        reason: a.delegation_reason || 'Cocok untuk delegasi'
      }))
    };

    // Group by date for week view
    const groupedByDate = {};
    enrichedAgendas.forEach(a => {
      const date = a.agenda_date;
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(a);
    });

    res.json({
      ok: true,
      data: enrichedAgendas,
      stats: {
        total,
        confirmed: enrichedAgendas.filter(a => a.status === 'confirmed').length,
        pending: enrichedAgendas.filter(a => a.status === 'pending').length,
        draft: enrichedAgendas.filter(a => a.status === 'draft').length,
        critical,
        high,
        medium,
        delegate,
        to_attend: toAttend,
        to_delegate: toDelegate,
        avg_kpi_score: Math.round(enrichedAgendas.reduce((sum, a) => sum + (a.kpi_score || 0), 0) / total) || 0,
        category_counts: categoryRanking
      },
      ai_analysis: {
        total_incoming: total,
        total_scheduled: enrichedAgendas.filter(a => a.status === 'confirmed').length,
        analyzed: total,
        critical_count: critical,
        high_count: high,
        medium_count: medium,
        delegate_count: delegate,
        recommendation: aiRecommendation.recommendation,
        attend: aiRecommendation.attend_list,
        delegate: aiRecommendation.delegate_list,
        week_label: date_from && date_to ? `${date_from} to ${date_to}` : 'Minggu Ini'
      }
    });
  } catch (err) {
    console.error('[minister/agendas]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get AI analysis for agendas ────────────────────────────── */
router.get('/agendas/analysis', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    const filters = {};
    if (date_from) filters.agenda_date = `gte.${date_from}`;
    if (date_to) filters.agenda_date = filters.agenda_date 
      ? `and(${filters.agenda_date},lte.${date_to})`
      : `lte.${date_to}`;
    
    const agendas = await pg.list('agendas', {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: 100,
      order: 'agenda_date.asc',
    });

    // Calculate KPI weights by category
    const categoryKPI = {};
    agendas.forEach(a => {
      const cat = a.category || 'internal';
      if (!categoryKPI[cat]) {
        categoryKPI[cat] = { total: 0, count: 0, name: cat };
      }
      categoryKPI[cat].total += a.kpi_score || 0;
      categoryKPI[cat].count += 1;
    });

    const categoryScores = Object.values(categoryKPI).map(c => ({
      category: c.name,
      avg_score: Math.round(c.total / c.count),
      count: c.count
    })).sort((a, b) => b.avg_score - a.avg_score);

    res.json({
      ok: true,
      data: {
        total_analyzed: agendas.length,
        category_scores: categoryScores,
        recommendations: {
          attend: agendas.filter(a => a.recommended_action === 'attend').map(a => ({
            id: a.id,
            title: a.title,
            kpi_score: a.kpi_score,
            reason: 'High strategic impact'
          })),
          delegate: agendas.filter(a => a.recommended_action === 'delegate').map(a => ({
            id: a.id,
            title: a.title,
            kpi_score: a.kpi_score,
            reason: a.delegation_reason || 'Suitable for delegation'
          }))
        }
      }
    });
  } catch (err) {
    console.error('[minister/analysis]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Get single agenda ───────────────────────────────────────── */
router.get('/agendas/:id', async (req, res) => {
  try {
    const agenda = await pg.get('agendas', req.params.id);
    if (!agenda) {
      return res.status(404).json({ ok: false, error: 'Agenda not found' });
    }
    res.json({ ok: true, data: agenda });
  } catch (err) {
    console.error('[minister/agenda]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Create agenda ──────────────────────────────────────────── */
router.post('/agendas', async (req, res) => {
  try {
    const { 
      title, description, location, 
      status = 'draft', category, attendees, purpose, 
      priority = 'medium', kpi_score, recommended_action, delegation_reason 
    } = req.body;
    
    // Support both old and new field names for backward compatibility
    const agenda_date = req.body.agenda_date || req.body.date;
    const agenda_time = req.body.agenda_time || req.body.time;
    
    if (!title || !agenda_date) {
      return res.status(400).json({ ok: false, error: 'Title and agenda_date (or date) required' });
    }
    
    const agenda = await pg.insert('agendas', {
      title,
      description,
      agenda_date,
      agenda_time,
      location,
      status,
      category,
      attendees,
      purpose,
      priority,
      kpi_score,
      recommended_action,
      delegation_reason,
      created_at: new Date().toISOString(),
    });
    
    console.log(`[minister/create] Created agenda: ${title} on ${agenda_date}`);
    
    res.status(201).json({ ok: true, data: agenda });
  } catch (err) {
    console.error('[minister/create]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Update agenda ──────────────────────────────────────────── */
router.patch('/agendas/:id', async (req, res) => {
  try {
    const updates = req.body;
    const agenda = await pg.update('agendas', req.params.id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    res.json({ ok: true, data: agenda });
  } catch (err) {
    console.error('[minister/update]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Delete agenda ──────────────────────────────────────────── */
router.delete('/agendas/:id', async (req, res) => {
  try {
    await pg.delete('agendas', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[minister/delete]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── List news links · Berita · Press Release · Dokumen ──────── */
router.get('/news', async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    
    const links = await pg.list('news_links', {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: parseInt(limit),
      order: 'publish_date.desc',
    });
    
    // Group by type for frontend
    const grouped = {};
    links.forEach(link => {
      const t = link.type || 'other';
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(link);
    });
    
    res.json({
      ok: true,
      data: links,
      grouped: grouped,
      summary: {
        total: links.length,
        news: grouped.news?.length || 0,
        press_release: grouped.press_release?.length || 0,
        regulation: grouped.regulation?.length || 0,
        media: grouped.media?.length || 0,
        minutes: grouped.minutes?.length || 0,
        reference: grouped.reference?.length || 0
      }
    });
  } catch (err) {
    console.error('[minister/news]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
