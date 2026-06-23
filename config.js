/**
 * KLH Chatbot — Configuration
 */
module.exports = {
  // PostgREST API (backend database proxy)
  postgrestUrl: process.env.POSTGREST_URL || 'http://127.0.0.1:4001',
  apiPort: process.env.PORT || 4003,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiToken: process.env.API_TOKEN || null,

  // Database (direct — fallback if PostgREST is unavailable)
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5436'),
    database: process.env.DB_NAME || 'klh',
    user: process.env.DB_USER || 'klh',
    password: process.env.DB_PASSWORD || '',
  },
};
