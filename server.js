/**
 * KLH Chatbot API Server
 * Bridges frontend UI to PostgREST database backend.
 *
 * Endpoints:
 *   /api/chat/*        — Chat messages & conversations
 *   /api/customers/*   — Customer CRUD
 *   /api/dashboard/*   — Dashboard statistics
 *   /api/knowledge/*   — Knowledge base documents
 *   /api/auth/*        — Authentication
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 4003;

/* ── WebSocket Setup ──────────────────────────────────────────── */

// Store connected clients
const wss = new WebSocket.Server({ noServer: true });
const clients = new Set();

wss.on('connection', (ws, req) => {
  const clientId = `${req.socket.remoteAddress}-${Date.now()}`;
  console.log(`[ws] Client connected: ${clientId}`);
  clients.add(ws);
  
  ws.on('close', () => {
    console.log(`[ws] Client disconnected: ${clientId}`);
    clients.delete(ws);
  });
  
  ws.on('error', (err) => {
    console.error(`[ws] Error from ${clientId}:`, err.message);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connection', 
    message: 'Connected to KLH Chatbot WebSocket',
    timestamp: new Date().toISOString()
  }));
});

// Broadcast function to send messages to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  let sentCount = 0;
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });
  
  console.log(`[ws] Broadcast to ${sentCount} clients:`, data.type);
}

// Export broadcast for use in routes
app.locals.broadcast = broadcast;

/* ── Middleware ────────────────────────────────────────────────── */

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
 methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

/* ── Routes ───────────────────────────────────────────────────── */

const chatRoutes = require('./routes/chat');
const customerRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');
const knowledgeRoutes = require('./routes/knowledge');
const authRoutes = require('./routes/auth');
const actionRoutes = require('./routes/actions');

app.use('/api/chat', chatRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/minister', require('./routes/minister'));
app.use('/webhook', require('./routes/webhook'));

/* ── Health check ─────────────────────────────────────────────── */

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'live',
    uptime: process.uptime(),
    websocket: {
      connected: clients.size,
      status: 'active'
    },
    timestamp: new Date().toISOString(),
  });
});

/* ── 404 handler ──────────────────────────────────────────────── */

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `route not found: ${req.method} ${req.originalUrl}` });
});

/* ── Error handler ────────────────────────────────────────────── */

app.use((err, req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ ok: false, error: err.message || 'internal server error' });
});

/* ── Start Server with WebSocket ──────────────────────────────── */

const server = http.createServer(app);

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[klh-api] Listening on http://0.0.0.0:${PORT}`);
  console.log(`[klh-api] WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`[klh-api] PostgREST backend: ${process.env.POSTGREST_URL || 'http://127.0.0.1:4001'}`);
  console.log(`[klh-api] Health: http://0.0.0.0:${PORT}/health`);
});

module.exports = { app, server, broadcast };
