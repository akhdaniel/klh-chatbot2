const BASE_URL = 'https://bff.xerpium.com'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Get fresh token from localStorage for each request
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
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
      total_tickets?: number
      open_tickets?: number
      total_customers?: number
      total_messages?: number
      avg_daily_chats?: number
      chat_delta?: number
      resolved_today?: number
      stats?: any[]
      [key: string]: any
    }>('/api/dashboard/kpis'),
}

// Tickets
export const ticketsApi = {
  list: (params?: {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    page?: number
    limit?: number
  }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString() : ''
    return api.get<{
      data: Ticket[]
      page: number
      limit: number
      total: number
    }>(`/api/tickets${qs}`)
  },
  create: (data: { title: string; description: string; category_id?: string }) =>
    api.post<Ticket>('/api/tickets/create', data),
  getStatus: (ticketNumber: string) =>
    api.get<Ticket>(`/api/tickets/status/${ticketNumber}`),
  updateStatus: (ticketId: string, status: string) =>
    api.patch<Ticket>(`/api/tickets/${ticketId}/status`, { status }),
}

// Chat
export const chatApi = {
  getHistory: (params: {
    customer_id?: string | number
    conversation_id?: string | number
    limit?: number
  }) => {
    const qs = '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()
    return api.get<Message[]>(`/api/chat/history${qs}`)
  },
  save: (data: { conversation_id: string; sender_type: string; content: string }) =>
    api.post('/api/chat/save', data),
}

// Customers
export const customersApi = {
  list: (params?: {
    search?: string
    page?: number
    limit?: number
  }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString() : ''
    return api.get<{
      data: Customer[]
      page: number
      limit: number
      total: number
    }>(`/api/customers${qs}`)
  },
}

// Knowledge Base
export const knowledgeApi = {
  upload: (formData: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return fetch(`${BASE_URL}/api/knowledge/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(r => r.json())
  },
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

function del(path: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  }).then(r => (r.status === 204 ? {} : r.json()))
}

// Minister dashboard CRUD
export const ministerApi = {
  // ── Agendas ────────────────────────────────────────────────────────────────
  getAgendas: (params?: {
    date?: string
    status?: string
    category?: string
    page?: number
    limit?: number
  }) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return api.get<any>(`/api/minister/agendas${qs}`)
  },
  createAgenda:  (data: Partial<Agenda>) => api.post<Agenda>('/api/minister/agendas', data),
  updateAgenda:  (id: string | number, data: Partial<Agenda>) => api.patch<Agenda>(`/api/minister/agendas/${id}`, data),
  deleteAgenda:  (id: string | number) => del(`/api/minister/agendas/${id}`),

  // ── Links (Tautan Berita / Press / Dokumen) ────────────────────────────────
  getLinks: (params?: { type?: string; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return api.get<any>(`/api/minister/links${qs}`)
  },
  createLink:  (data: Partial<MinisterLink>) => api.post<MinisterLink>('/api/minister/links', data),
  updateLink:  (id: number, data: Partial<MinisterLink>) => api.patch<MinisterLink>(`/api/minister/links/${id}`, data),
  deleteLink:  (id: number) => del(`/api/minister/links/${id}`),

  // ── Invitations (Undangan Masuk) ───────────────────────────────────────────
  getInvitations: (params?: { date?: string; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return api.get<any>(`/api/minister/invitations${qs}`)
  },
  createInvitation:  (data: Partial<MinisterInvitation>) => api.post<MinisterInvitation>('/api/minister/invitations', data),
  respondInvitation: (id: number, action: 'confirm' | 'delegate' | 'decline', delegate_to?: string) =>
    api.patch<MinisterInvitation>(`/api/minister/invitations/${id}/respond`, { action, delegate_to }),
  deleteInvitation:  (id: number) => del(`/api/minister/invitations/${id}`),

  // ── Recommendations (AI Analisis) ─────────────────────────────────────────
  getRecommendations: () => api.get<any>('/api/minister/recommendations'),
  createRecommendation: (data: Partial<MinisterRecommendation>) =>
    api.post<MinisterRecommendation>('/api/minister/recommendations', data),
  deleteRecommendation: (id: number) => del(`/api/minister/recommendations/${id}`),

  // ── KPI Weights ────────────────────────────────────────────────────────────
  getKpiWeights: () => api.get<MinisterKpiWeight[]>('/api/minister/kpi-weights'),
  updateKpiWeight: (category: string, weight: number) =>
    api.patch<MinisterKpiWeight>(`/api/minister/kpi-weights/${category}`, { weight }),

  // ── Achievements ───────────────────────────────────────────────────────────
  getAchievements: (params?: { limit?: number; page?: number }) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return api.get<any>(`/api/minister/achievements${qs}`)
  },
  createAchievement:  (data: Partial<Achievement>) => api.post<Achievement>('/api/minister/achievements', data),
  updateAchievement:  (id: string | number, data: Partial<Achievement>) => api.patch<Achievement>(`/api/minister/achievements/${id}`, data),
  deleteAchievement:  (id: string | number) => del(`/api/minister/achievements/${id}`),
}

// Types are imported from types/index.ts
import type {
  User, Customer, Category, Ticket, TicketHistory,
  Conversation, Message, KnowledgeDoc, ChatbotConfig,
  DailyStats, TicketSummary, ProvinceCount, CategoryStats
} from '../types'
import type { Agenda, Achievement, MinisterProfileUpdate } from '../types/agenda'

export interface MinisterLink {
  id: number
  type: 'berita' | 'press_release' | 'dokumen'
  title: string
  url: string
  source?: string
  published_at?: string
  is_featured?: boolean
}

export interface MinisterInvitation {
  id: number
  from: string
  event: string
  date: string
  status?: 'pending' | 'confirmed' | 'delegated' | 'declined'
  delegate_to?: string
}

export interface MinisterRecommendation {
  id: number
  type: 'attend' | 'delegate'
  agenda_id?: number
  title: string
  reason: string
  delegate_to?: string
}

export interface MinisterKpiWeight {
  category: string
  weight: number
}

export type {
  User, Customer, Category, Ticket, TicketHistory,
  Conversation, Message, KnowledgeDoc, ChatbotConfig,
  DailyStats, TicketSummary, ProvinceCount, CategoryStats,
  Agenda, Achievement, MinisterProfileUpdate
}
