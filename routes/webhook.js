/**
 * Webhook routes - untuk menerima pesan dari WhatsApp API / OpenClaw
 */
const express = require('express');
const router = express.Router();
const pg = require('../lib/postgrest');

/* ── Webhook untuk pesan masuk dari WhatsApp ──────────────────── */
router.post('/whatsapp', async (req, res) => {
  try {
    const {
      phone,
      message,
      sender_type = 'customer',
      platform = 'whatsapp',
      name = null,
      timestamp = new Date().toISOString()
    } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        ok: false, 
        error: 'phone and message are required' 
      });
    }

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    // Save to database (saveChat already inserts to messages via RPC)
    const result = await pg.saveChat(
      normalizedPhone, 
      message, 
      sender_type, 
      platform, 
      name
    );
    
    // Note: pg.saveChat() calls chat_save RPC which already inserts into messages table
    // No need to insert again here to avoid duplication
    
    // Broadcast to WebSocket clients
    const broadcast = req.app.locals.broadcast;
    if (broadcast) {
      broadcast({
        type: 'new_message',
        data: {
          phone: normalizedPhone,
          message,
          sender_type,
          platform,
          name,
          conversation_id: result.conversation_id,
          message_id: result.message_id,
          timestamp
        }
      });
      
      broadcast({
        type: 'conversation_updated',
        data: {
          conversation_id: result.conversation_id,
          last_message: message,
          last_message_at: timestamp,
          sender_type
        }
      });
    }

    console.log(`[webhook/whatsapp] Saved message from ${normalizedPhone}: ${message.substring(0, 50)}...`);
    
    res.json({ 
      ok: true, 
      message_id: result.message_id,
      conversation_id: result.conversation_id,
      saved: true
    });
    
  } catch (err) {
    console.error('[webhook/whatsapp]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Webhook untuk response AI (bot) ──────────────────────────── */
router.post('/bot-response', async (req, res) => {
  try {
    const {
      phone,
      message,
      platform = 'whatsapp',
      name = 'KLH Asisten',
      timestamp = new Date().toISOString()
    } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        ok: false, 
        error: 'phone and message are required' 
      });
    }

    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    const result = await pg.saveChat(
      normalizedPhone,
      message,
      'bot',
      platform,
      name
    );

    // Note: pg.saveChat() calls chat_save RPC which already inserts into messages table
    // No need to insert again here to avoid duplication
    
    // Broadcast
    const broadcast = req.app.locals.broadcast;
    if (broadcast) {
      broadcast({
        type: 'new_message',
        data: {
          phone: normalizedPhone,
          message,
          sender_type: 'bot',
          platform,
          name,
          conversation_id: result.conversation_id,
          message_id: result.message_id,
          timestamp
        }
      });
    }

    console.log(`[webhook/bot] Saved bot response to ${normalizedPhone}`);
    
    res.json({ 
      ok: true, 
      message_id: result.message_id,
      conversation_id: result.conversation_id
    });
    
  } catch (err) {
    console.error('[webhook/bot]', err.message);
    res.status(502).json({ ok: false, error: err.message });
  }
});

/* ── Simple ping endpoint for testing ─────────────────────────── */
router.get('/ping', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
