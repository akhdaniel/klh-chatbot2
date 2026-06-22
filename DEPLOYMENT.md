# Vercel Deployment Guide

## Problem: Mixed Content Error

When deployed on Vercel (HTTPS), the app blocks HTTP requests to pgREST for security reasons.

```
Blocked loading mixed active content "http://124.156.205.118:3001/..."
```

## Solution: Backend Proxy (Recommended)

The project now includes a Vercel serverless function (`/api/proxy.ts`) that proxies pgREST requests through HTTPS.

### How It Works

1. **Frontend** makes requests to `/api/proxy/tickets?...`
2. **Vercel serverless** proxies to `http://124.156.205.118:3001/tickets?...`
3. **Response** sent back over HTTPS

### Deployment Steps

#### 1. Connect to Vercel

```bash
npm install -g vercel
vercel login
cd /Users/daniel/data/klh-dashboard
vercel
```

#### 2. Set Environment Variables in Vercel Dashboard

Go to: **Project Settings → Environment Variables**

Add:
```
PGREST_URL = http://124.156.205.118:3001
```

Or leave it empty to use the default.

#### 3. Deploy

```bash
vercel --prod
```

#### 4. Verify

- Check Vercel deployment logs
- Visit your Vercel URL
- Open browser console (F12) - should see no mixed content errors

### Alternative Solutions

#### Option A: HTTPS on pgREST Server

If you can enable HTTPS on your pgREST server:

1. Update `VITE_API_URL` in Vercel environment:
   ```
   VITE_API_URL=https://your-api-domain.com:3001
   ```

2. Remove the proxy requirement in `src/api/pgrest.ts`

#### Option B: Manual Environment Variable

If you don't want to use the proxy, set in Vercel:

```
VITE_API_URL=http://124.156.205.118:3001
```

**Note**: This still requires CORS and HTTPS support on the pgREST server.

## Local Development

```bash
npm run dev
# Uses: http://124.156.205.118:3001
```

Override locally:
```bash
# .env.local
VITE_API_URL=http://your-local-api:3001
```

## Files Added

- `/api/proxy.ts` - Vercel serverless function that proxies pgREST requests
- `/.env.local` - Local development environment
- `/.env.production` - Production environment template

## Troubleshooting

### Still getting mixed content error?

1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Clear browser cache
3. Check Vercel function logs: `vercel logs`

### Proxy returning 500 error?

1. Verify `PGREST_URL` is set correctly in Vercel dashboard
2. Check that pgREST server is accessible: `curl http://124.156.205.118:3001/tickets?limit=1`
3. View Vercel logs for detailed error

### CORS errors?

The proxy includes CORS headers. If still getting errors:

1. Ensure pgREST is responding to the proxy requests
2. Check network tab in DevTools
3. View serverless function logs

## Production URL

Your app will be available at:
```
https://your-project.vercel.app
```

Dashboard:
```
https://your-project.vercel.app → Dashboard view with real data
```

## Rollback

If deployment has issues:

```bash
vercel rollback
```
