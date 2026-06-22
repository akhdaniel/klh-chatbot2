const BASE_URL = 'https://bff.xerpium.com'

// Store JWT token in localStorage
let authToken: string | null = null

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('authToken')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Add JWT token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      headers,
      ...options,
    })

    if (!res.ok) {
      console.error(`API error ${res.status}: ${res.statusText}`)
      throw new Error(`${res.status} ${res.statusText}`)
    }

    return res.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  setToken: (token: string) => {
    authToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  },
  clearToken: () => {
    authToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  },
}

// Authentication
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string }>('/api/auth/login', { username, password }),
  signup: (username: string, password: string) =>
    api.post<{ token: string }>('/api/auth/signup', { username, password }),
}

// Dashboard / KPIs
export const dashboardApi = {
  getKPIs: () =>
    api.get<{
      totalTickets: number
      openTickets: number
      activeCustomers: number
      avgResolutionTime: number
      csat: number
    }>('/api/dashboard/kpis'),
}

// Tickets
export const ticketsApi = {
  create: (data: { title: string; description: string; category_id?: string }) =>
    api.post<Ticket>('/api/tickets/create', data),
  getStatus: (ticketNumber: string) =>
    api.get<Ticket>(`/api/tickets/status/${ticketNumber}`),
  updateStatus: (ticketId: string, status: string) =>
    api.patch<Ticket>(`/api/tickets/${ticketId}/status`, { status }),
  // Legacy pgREST methods for compatibility
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get<Ticket[]>(`/tickets${qs}`)
  },
}

// Chat
export const chatApi = {
  save: (data: { conversation_id: string; sender_type: string; content: string }) =>
    api.post('/api/chat/save', data),
}

// Knowledge Base
export const knowledgeApi = {
  upload: (formData: FormData) =>
    fetch(`${BASE_URL}/api/knowledge/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    }).then(r => r.json()),
}

// WhatsApp
export const whatsappApi = {
  getQRStatus: () =>
    api.get('/api/whatsapp/qr'),
  setQRCode: (qrCode: string) =>
    api.post('/api/whatsapp/qr', { qrCode }),
  getQRImage: () =>
    `${BASE_URL}/api/whatsapp/qr.png`,
  receiveMessage: (data: unknown) =>
    api.post('/api/whatsapp/receive', data),
}

// Types are imported from types/index.ts
import type {
  User, Customer, Category, Ticket, TicketHistory,
  Conversation, Message, KnowledgeDoc, ChatbotConfig,
  DailyStats, TicketSummary, ProvinceCount, CategoryStats
} from '../types'
export type {
  User, Customer, Category, Ticket, TicketHistory,
  Conversation, Message, KnowledgeDoc, ChatbotConfig,
  DailyStats, TicketSummary, ProvinceCount, CategoryStats
}
