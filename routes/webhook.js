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
    
    // Save to database
    const result = await pg.saveChat(
      normalizedPhone, 
      message, 
      sender_type, 
      platform, 
      name
    );
    
    // Also insert into messages table for chat history
    if (result.conversation_id) {
      try {
        await pg.insert('messages', {
          conversation_id: result.conversation_id,
          sender_type: sender_type,
          content: message,
          created_at: new Date().toISOString()
        });
        console.log(`[webhook/whatsapp] Message saved to messages table for conversation ${result.conversation_id}`);
      } catch (msgErr) {
        console.error('[webhook/whatsapp] Failed to save message:', msgErr.message);
      }
    }
    
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
    
    // Also insert into messages table for chat history
    if (result.conversation_id) {
      try {
        await pg.insert('messages', {
          conversation_id: result.conversation_id,
          sender_type: 'bot',
          content: message,
          created_at: new Date().toISOString()
        });
        console.log(`[webhook/bot] Bot message saved to messages table for conversation ${result.conversation_id}`);
      } catch (msgErr) {
        console.error('[webhook/bot] Failed to save message:', msgErr.message);
      }
    }
    
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
