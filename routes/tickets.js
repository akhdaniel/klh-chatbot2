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

/* ── Helper: Find or create a conversation by phone ─────────── */
async function findOrCreateConversation(phone, name, platform = 'whatsapp') {
  try {
    if (!phone) return null;

    // Normalize phone: try both with and without + prefix
    const phoneVariants = [
      { phone: phone },
      { phone: phone.replace(/^\+/, '') },
      { phone: '+' + phone.replace(/^\+/, '') }
    ];

    let existing = null;
    for (const filter of phoneVariants) {
      existing = await pg.list('conversations', {
        filters: filter,
        limit: 1
      });
      if (existing && existing.length > 0) break;
    }

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    // Create new conversation
    const newConv = await pg.insert('conversations', {
      phone: phone,
      name: name || phone,
      platform: platform,
      status: 'active',
      category: 'general',
      priority: 'normal',
      unread_count: 0,
      last_message: '',
      last_message_at: new Date().toISOString()
    });

    // PostgREST insert may return empty without Prefer header
    // Try to find the conversation we just created
    if (!newConv || (Array.isArray(newConv) && newConv.length === 0)) {
      // Query for the conversation by phone
      const found = await pg.list('conversations', {
        filters: { phone: phone },
        limit: 1,
        order: 'id.desc'
      });
      return found && found.length > 0 ? found[0].id : null;
    }

    return Array.isArray(newConv) ? newConv[0]?.id : newConv?.id;
  } catch (err) {
    console.warn('[tickets/findOrCreateConversation] Error:', err.message);
    return null;
  }
}

/* ── Create ticket ──────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { subject, description, priority = 'medium', customer_id, reporter_phone, reporter_name, platform = 'whatsapp' } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({ ok: false, error: 'Subject and description required' });
    }

    // Find or create conversation
    const conversationId = await findOrCreateConversation(reporter_phone, reporter_name, platform);
    
    const ticket = await pg.insert('tickets', {
      subject,
      description,
      priority,
      customer_id,
      conversation_id: conversationId,
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

    // Find or create conversation for this phone
    const conversationId = await findOrCreateConversation(phone, name, platform);

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
        conversation_id: conversationId,
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

    res.json({
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
  
  // ===== CRITICAL / URGENT CASES =====
  
  // Forest fires (Karhutla) - CRITICAL
  if (lowerMsg.match(/kebakaran.*hutan|karhutla|kebakaran.*lahan|asap.*tebal|api.*besar/)) {
    return 'karhutla';
  }
  
  // Natural disasters - CRITICAL
  if (lowerMsg.match(/tanah.*longsor|longsor|banjir.*bandang|tsunami|gempa.*bumi/)) {
    return 'bencana_alam';
  }
  
  // Severe pollution - HIGH PRIORITY
  if (lowerMsg.match(/radioaktif|nuklir|kimia.*berbahaya|merkuri|asap.*beracun/)) {
    return 'pencemaran_berbahaya';
  }
  
  // Flooding - HIGH PRIORITY
  if (lowerMsg.match(/banjir|genangan|air.*naik|air.*masuk.*rumah/)) {
    return 'banjir';
  }
  
  // Wildlife hunting/trade - HIGH PRIORITY
  if (lowerMsg.match(/buru.*satwa|jual.*satwa|perdagangan.*satwa|satwa.*dilindungi/)) {
    return 'perdagangan_satwa';
  }
  
  // Illegal fishing - HIGH PRIORITY
  if (lowerMsg.match(/bom.*ikan|bius.*ikan|pukat.*harimau|fishing.*ilegal/)) {
    return 'penangkapan_ilegal';
  }
  
  // ===== MEDIUM PRIORITY CASES =====
  
  // Environmental pollution (general)
  if (lowerMsg.match(/pencemar|cemar|limbah|sungai.*kotor|air.*hitam|bau.*busuk/)) {
    return 'pencemaran';
  }
  
  // Illegal logging
  if (lowerMsg.match(/tebang.*liar|illegal.*logging|penebangan.*ilegal/)) {
    return 'penebangan_ilegal';
  }
  
  // Illegal mining
  if (lowerMsg.match(/tambang.*ilegal|penambangan.*liar/)) {
    return 'tambang_ilegal';
  }
  
  // Ecosystem damage
  if (lowerMsg.match(/terumbu.*karang.*rusak|mangrove.*tebang|hutan.*mangrove/)) {
    return 'kerusakan_ekosistem';
  }
  
  // National park damage
  if (lowerMsg.match(/taman.*nasional.*rusak|tn.*rusak|kawasan.*lindung/)) {
    return 'kerusakan_tn';
  }
  
  // ===== LOW PRIORITY CASES =====
  
  // AMDAL/permits
  if (lowerMsg.match(/amdal|izin|perizinan|dokumen.*lingkungan/)) {
    return 'persuratan';
  }
  
  // General complaints
  if (lowerMsg.match(/lapor|pengaduan|komplain/)) {
    return 'pengaduan';
  }
  
  // Default
  return 'umum';
}

function determinePriority(message, category) {
  const lowerMsg = message.toLowerCase();
  
  // ===== CRITICAL PRIORITY =====
  // Life-threatening emergencies
  if (lowerMsg.match(/kebakaran.*hutan|karhutla|kebakaran.*besar|meninggal.*dunia/)) {
    return 'critical';
  }
  
  // Natural disasters with casualties
  if (lowerMsg.match(/tanah.*longsor.*korban|banjir.*bandang.*korban|tsunami/)) {
    return 'critical';
  }
  
  // Hazardous pollution
  if (lowerMsg.match(/radioaktif|nuklir|kimia.*berbahaya/)) {
    return 'critical';
  }
  
  // ===== HIGH PRIORITY =====
  if (lowerMsg.match(/darurat|segera|cepat|urgent|kritis|banyak.*korban|tenggelam/)) {
    return 'high';
  }
  
  // Category-based high priority
  if (['karhutla', 'bencana_alam', 'banjir', 'pencemaran_berbahaya'].includes(category)) {
    return 'high';
  }
  
  if (['perdagangan_satwa', 'penangkapan_ilegal'].includes(category)) {
    return 'high';
  }
  
  // ===== MEDIUM PRIORITY =====
  if (['pencemaran', 'penebangan_ilegal', 'tambang_ilegal', 
        'kerusakan_ekosistem', 'kerusakan_tn'].includes(category)) {
    return 'medium';
  }
  
  return 'low';
}

function generateTicketNumber(category) {
  const prefixes = {
    'pencemaran': 'PCM',
    'pencemaran_berbahaya': 'PCB',
    'karhutla': 'KHL',
    'bencana_alam': 'BNA',
    'penebangan_ilegal': 'PLG',
    'perdagangan_satwa': 'KSV',
    'penangkapan_ilegal': 'PNG',
    'tambang_ilegal': 'TMG',
    'banjir': 'BJR',
    'kerusakan_ekosistem': 'EKO',
    'kerusakan_tn': 'KTN',
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
    // Critical/Urgent cases
    'karhutla': `🚨 *LAPORAN DARURAT - KEBAKARAN HUTAN* 🚨\n\n📋 Nomor Tiket: *${ticketNumber}*\n🚨 Prioritas: CRITICAL\n\nTim pemadam kebakaran dan Manggala Agni akan segera diterjunkan ke lokasi. Tetap tenang dan jaga keselamatan.`,
    
    'bencana_alam': `🆘 *LAPORAN BENCANA ALAM* 🆘\n\n📋 Nomor Tiket: *${ticketNumber}*\n🚨 Prioritas: HIGH\n\nTim SAR dan relawan akan segera merespons. Pastikan keselamatan diri dan keluarga Anda terlebih dahulu.`,
    
    'pencemaran_berbahaya': `☣️ *LAPORAN PENCEMARAN BERBAHAYA* ☣️\n\n📋 Nomor Tiket: *${ticketNumber}*\n🚨 Prioritas: CRITICAL\n\nTim tanggap darurat pencemaran akan segera diturunkan. Jauhi area terdampak dan ikuti arahan petugas.`,
    
    'banjir': `🌊 *LAPORAN BENCANA BANJIR* 🌊\n\n📋 Nomor Tiket: *${ticketNumber}*\n🚨 Prioritas: HIGH\n\nTim SAR dan BPBD akan segera merespons. Segera evakuasi ke tempat yang lebih tinggi dan aman.`,
    
    // High priority cases
    'perdagangan_satwa': `🦅 *LAPORAN PERDAGANGAN SATWA LIAR* 🦅\n\n📋 Nomor Tiket: *${ticketNumber}*\n⚠️ Prioritas: HIGH\n\nTim Gakkum akan segera menindaklanjuti. Identitas pelapor dijaga kerahasiaannya.`,
    
    'penangkapan_ilegal': `🎣 *LAPORAN PENANGKAPAN IKAN ILEGAL* 🎣\n\n📋 Nomor Tiket: *${ticketNumber}*\n⚠️ Prioritas: HIGH\n\nTim patroli laut akan segera merespons. Terima kasih atas kepedulian terhadap kelautan kita.`,
    
    // Medium priority cases
    'pencemaran': `💧 *LAPORAN PENCEMARAN LINGKUNGAN* 💧\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: MEDIUM\n\nTim pengawas lingkungan akan menindaklanjuti dalam 2x24 jam. Dokumentasikan dengan foto jika memungkinkan.`,
    
    'penebangan_ilegal': `🌲 *LAPORAN PENEBANGAN HUTAN ILEGAL* 🌲\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: MEDIUM\n\nTim monitoring hutan akan segera mengecek lokasi. Mohon informasi koordinat atau lokasi spesifik.`,
    
    'tambang_ilegal': `⛏️ *LAPORAN TAMBANG ILEGAL* ⛏️\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: MEDIUM\n\nTim pengawas tambang akan segera menindaklanjuti. Pastikan lokasi tambang diluar izin resmi.`,
    
    'kerusakan_ekosistem': `🪸 *LAPORAN KERUSAKAN EKOSISTEM* 🪸\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: MEDIUM\n\nTim ahli ekosistem akan mengevaluasi kerusakan. Terima kasih atas kepedulian terhadap keanekaragaman hayati.`,
    
    'kerusakan_tn': `🏞️ *LAPORAN KERUSAKAN TAMAN NASIONAL* 🏞️\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: MEDIUM\n\nTim Balai Taman Nasional akan segera menindaklanjuti. Kawasan konservasi harus dilindungi.`,
    
    // Low priority
    'persuratan': `📄 *PERMOHONAN INFORMASI* 📄\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: LOW\n\nTim admin akan merespons dalam 3-5 hari kerja. Silakan cek status secara berkala.`,
    
    'pengaduan': `📢 *PENGADUAN UMUM* 📢\n\n📋 Nomor Tiket: *${ticketNumber}*\n📊 Prioritas: LOW\n\nTim customer service akan merespons dalam 2x24 jam. Terima kasih atas masukannya.`,
    
    'default': `✅ *LAPORAN DITERIMA* ✅\n\n📋 Nomor Tiket: *${ticketNumber}*\n\nTerima kasih atas laporannya. Tim kami akan menindaklanjuti sesuai prosedur. Pantau status laporan Anda di aplikasi KLH.`
  };
  
  return responses[category] || responses['default'];
}

/* ── Get chat history for a ticket ───────────────────────────── */
router.get('/:id/chat-history', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // Get ticket to find conversation_id
    const ticket = await pg.get('tickets', id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket not found' });
    }

    if (!ticket.conversation_id) {
      return res.status(404).json({ ok: false, error: 'No conversation linked to this ticket' });
    }

    // Get messages from conversation
    const messages = await pg.list('messages', {
      filters: { conversation_id: ticket.conversation_id },
      limit: parseInt(limit),
      order: 'created_at.asc'
    });

    res.json({
      ok: true,
      data: messages,
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        conversation_id: ticket.conversation_id
      }
    });

  } catch (err) {
    console.error('[tickets/chat-history]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

module.exports = router;
