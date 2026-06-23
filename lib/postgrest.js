/**
 * PostgREST client helper
 * Wraps HTTP calls to local PostgREST instance.
 */
const axios = require('axios');

const POSTGREST_URL = process.env.POSTGREST_URL || 'http://127.0.0.1:4001';

class PostgrestClient {
  constructor(baseUrl) {
    this.client = axios.create({
      baseURL: baseUrl || POSTGREST_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /* ── Table queries ─────────────────────────────────────────── */

  /** List rows from a table */
  async list(table, opts = {}) {
    const params = {};
    if (opts.select) params.select = opts.select;
    if (opts.order) params.order = opts.order;
    if (opts.limit) params.limit = opts.limit;
    if (opts.offset) params.offset = opts.offset;
    if (opts.filters) {
      Object.entries(opts.filters).forEach(([k, v]) => {
        params[k] = `eq.${v}`;
      });
    }

    const res = await this.client.get(`/${table}`, { params });
    return res.data;
  }

  /** Get a single row by ID */
  async get(table, id, idCol = 'id') {
    const res = await this.client.get(`/${table}`, {
      params: { [idCol]: `eq.${id}`, limit: 1 },
    });
    return res.data?.[0] || null;
  }

  /** Insert a row */
  async insert(table, data) {
    const res = await this.client.post(`/${table}`, data);
    return res.data;
  }

  /** Update rows */
  async update(table, id, data, idCol = 'id') {
    const res = await this.client.patch(`/${table}`, data, {
      params: { [idCol]: `eq.${id}` },
    });
    return res.data;
  }

  /** Delete rows */
  async delete(table, id, idCol = 'id') {
    const res = await this.client.delete(`/${table}`, {
      params: { [idCol]: `eq.${id}` },
    });
    return res.data;
  }

  /* ── Stored Procedures ─────────────────────────────────────── */

  /** Call an RPC function */
  async rpc(name, params = {}) {
    const res = await this.client.post(`/rpc/${name}`, params);
    return res.data;
  }

  /** Save a chat message (wraps chat_save RPC) */
  async saveChat(phone, message, senderType = 'customer', platform = 'whatsapp', name = null) {
    return this.rpc('chat_save', {
      p_phone: phone,
      p_message: message,
      p_sender_type: senderType,
      p_platform: platform,
      p_name: name,
    });
  }
}

module.exports = new PostgrestClient();
module.exports.PostgrestClient = PostgrestClient;
