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

/* ── Auto-create ticket from chat ────────────────────────────── */
router.post('/auto-create', async (req, res) => {
  try {
    const { 
      message, 
      phone, 
      name = 'Anonim',
      platform = 'whatsapp'
    } = req.body;

    if (!message) {
      return res.status(400).json({ ok: false, error: 'Message required' });
    }

    // AI Classification Logic
    const category = classifyMessage(message);
    const priority = determinePriority(message, category);
    const isUrgent = priority === 'high' || priority === 'critical';

    // Generate ticket number
    const ticketNumber = generateTicketNumber(category);

    // Create ticket
    let ticket;
    try {
      ticket = await pg.insert('tickets', {
        ticket_number: ticketNumber,
        title: message.substring(0, 100),
        description: message,
        category: category,
        priority: priority,
        status: 'open',
        source: platform,
        reporter_phone: phone,
        reporter_name: name,
        created_at: new Date().toISOString(),
      });
    } catch (insertErr) {
      console.error('[tickets/auto-create] Insert error:', insertErr.message);
      console.error('[tickets/auto-create] Insert error details:', insertErr.response?.data);
      throw insertErr;
    }

    // Broadcast update
    const broadcast = req.app.locals.broadcast;
    if (broadcast) {
      broadcast({
        type: 'new_ticket',
        data: {
          ticket_id: ticket.id,
          ticket_number: ticketNumber,
          category: category,
          priority: priority,
          message: message.substring(0, 50)
        }
      });
    }

    res.status(201).json({ 
      ok: true, 
      data: {
        ticket,
        ticket_number: ticketNumber,
        category: category,
        priority: priority,
        is_urgent: isUrgent,
        auto_response: generateAutoResponse(category, ticketNumber, isUrgent)
      }
    });

  } catch (err) {
    console.error('[tickets/auto-create]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

// AI Classification Functions
function classifyMessage(message) {
  const lowerMsg = message.toLowerCase();
  
  // Check for environmental pollution
  if (lowerMsg.match(/pencemar|cemar|limbah|sungai.*kotor|air.*hitam|bau/)) {
    return 'pencemaran';
  }
  
  // Check for forest fires
  if (lowerMsg.match(/kebakaran|asap|api|hutan.*terbakar|lahan.*gosong/)) {
    return 'karhutla';
  }
  
  // Check for illegal logging
  if (lowerMsg.match(/tebang.*liar|illegal.*logging|penebangan.*ilegal/)) {
    return 'penebangan_ilegal';
  }
  
  // Check for wildlife trade
  if (lowerMsg.match(/jual.*satwa|perdagangan.*satwa|satwa.*dilindungi/)) {
    return 'perdagangan_satwa';
  }
  
  // Check for mining
  if (lowerMsg.match(/tambang.*ilegal|penambangan.*liar/)) {
    return 'tambang_ilegal';
  }
  
  // Check for flooding
  if (lowerMsg.match(/banjir|genangan|air.*naik/)) {
    return 'banjir';
  }
  
  // Check for AMDAL/permits
  if (lowerMsg.match(/amdal|izin|perizinan|dokumen.*lingkungan/)) {
    return 'persuratan';
  }
  
  // Check for general complaints
  if (lowerMsg.match(/lapor|pengaduan|komplain/)) {
    return 'pengaduan';
  }
  
  // Default
  return 'umum';
}

function determinePriority(message, category) {
  const lowerMsg = message.toLowerCase();
  
  // Critical keywords
  if (lowerMsg.match(/kebakaran.*hutan|karhutla|kebakaran.*besar/)) {
    return 'critical';
  }
  
  // High priority keywords
  if (lowerMsg.match(/darurat|segera|cepat|urgent|kritis|banyak.*korban|tenggelam|meninggal/)) {
    return 'high';
  }
  
  // Category-based priority
  if (category === 'karhutla' || category === 'banjir') {
    return 'high';
  }
  
  if (category === 'pencemaran' || category === 'perdagangan_satwa') {
    return 'medium';
  }
  
  return 'low';
}

function generateTicketNumber(category) {
  const prefixes = {
    'pencemaran': 'PCM',
    'karhutla': 'KHL',
    'penebangan_ilegal': 'PLG',
    'perdagangan_satwa': 'KSV',
    'tambang_ilegal': 'TMG',
    'banjir': 'BJR',
    'persuratan': 'SRT',
    'pengaduan': 'CRB',
    'umum': 'UMM'
  };
  
  const prefix = prefixes[category] || 'KLH';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  
  return `KLH-${prefix}-${year}-${random}`;
}

function generateAutoResponse(category, ticketNumber, isUrgent) {
  const responses = {
    'pencemaran': `Laporan pencemaran lingkungan Anda telah dicatat dengan nomor tiket: *${ticketNumber}*. Tim kami akan segera menindaklanjuti.`,
    'karhutla': `🚨 LAPORAN DARURAT KEBAKARAN HUTAN 🚨\n\nNomor Tiket: *${ticketNumber}*\n\nTim pemadam akan segera diterjunkan ke lokasi.`,
    'banjir': `Laporan bencana banjir tercatat dengan nomor tiket: *${ticketNumber}*. Tim SAR akan segera merespons.`,
    'default': `Terima kasih atas laporannya. Tiket Anda: *${ticketNumber}*. Tim kami akan menindaklanjuti dalam 2x24 jam.`
  };
  
  return responses[category] || responses['default'];
}

module.exports = router;
