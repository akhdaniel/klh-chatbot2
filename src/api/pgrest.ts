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

// Minister Agenda & Achievements
export const ministerApi = {
  // Agenda endpoints
  getAgendas: (params?: { status?: string; limit?: number; page?: number }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString() : ''
    return api.get<{
      data: any[]
      page: number
      limit: number
      total: number
    } | any[]>(`/api/minister/agendas${qs}`)
  },
  createAgenda: (data: any) =>
    api.post('/api/minister/agendas', data),
  updateAgenda: (id: string | number, data: Partial<any>) =>
    api.patch(`/api/minister/agendas/${id}`, data),
  deleteAgenda: (id: string | number) =>
    api.patch(`/api/minister/agendas/${id}`, { status: 'cancelled' }),

  // Achievements endpoints
  getAchievements: (params?: { limit?: number; page?: number }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString() : ''
    return api.get<{
      data: any[]
      page: number
      limit: number
      total: number
    } | any[]>(`/api/minister/achievements${qs}`)
  },
  createAchievement: (data: any) =>
    api.post('/api/minister/achievements', data),
  updateAchievement: (id: string | number, data: Partial<any>) =>
    api.patch(`/api/minister/achievements/${id}`, data),
  deleteAchievement: (id: string | number) =>
    api.patch(`/api/minister/achievements/${id}`, { deleted_at: new Date().toISOString() }),
}

// Types are imported from types/index.ts
import type {
  User, Customer, Category, Ticket, TicketHistory,
  Conversation, Message, KnowledgeDoc, ChatbotConfig,
  DailyStats, TicketSummary, ProvinceCount, CategoryStats
} from '../types'
import type { Agenda, Achievement, MinisterProfileUpdate } from '../types/agenda'

export type {
  User, Customer, Category, Ticket, TicketHistory,
  Conversation, Message, KnowledgeDoc, ChatbotConfig,
  DailyStats, TicketSummary, ProvinceCount, CategoryStats,
  Agenda, Achievement, MinisterProfileUpdate
}
