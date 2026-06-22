import { VercelRequest, VercelResponse } from '@vercel/node'

const PGREST_URL = process.env.PGREST_URL || 'http://124.156.205.118:3001'

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Extract the path after /api/proxy/ and reconstruct full URL with query string
    const pathname = req.url?.replace(/^\/api\/proxy\/?/, '/') || '/'
    const queryString = req.url?.includes('?') ? '?' + req.url.split('?')[1] : ''
    const url = `${PGREST_URL}${pathname}${queryString}`

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: req.method === 'POST' || req.method === 'PATCH' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
    res.setHeader('Content-Type', 'application/json')

    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({ error: 'Proxy request failed' })
  }
}
