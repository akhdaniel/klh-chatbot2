const BASE_URL = 'https://pgrest.xerpium.com/klh'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      ...options,
    })
    if (!res.ok) {
      console.error(`pgREST error ${res.status}: ${res.statusText}`)
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

// Users
export const usersApi = {
  list: () => api.get<User[]>('/users'),
  get: (id: string) => api.get<User>(`/users?id=eq.${id}`),
}

// Customers
export const customersApi = {
  list: () => api.get<Customer[]>('/customers'),
  get: (id: string) => api.get<Customer>(`/customers?id=eq.${id}`),
  getByPhone: (phone: string) => api.get<Customer[]>(`/customers?wa_phone=eq.${phone}`),
}

// Categories
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories?order=sort_order.asc'),
  get: (id: string) => api.get<Category>(`/categories?id=eq.${id}`),
}

// Tickets
export const ticketsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get<Ticket[]>(`/tickets${qs}`)
  },
  get: (id: string) => api.get<Ticket>(`/tickets?id=eq.${id}`),
  update: (id: string, body: Partial<Ticket>) =>
    api.patch<Ticket>(`/tickets?id=eq.${id}`, body),
  byTicketNumber: (number: string) => api.get<Ticket[]>(`/tickets?ticket_number=eq.${number}`),
}

// Ticket History
export const ticketHistoryApi = {
  list: (ticketId: string) => api.get<TicketHistory[]>(`/ticket_history?ticket_id=eq.${ticketId}`),
}

// Conversations
export const conversationsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get<Conversation[]>(`/conversations${qs}`)
  },
  get: (id: string) => api.get<Conversation>(`/conversations?id=eq.${id}`),
}

// Messages
export const messagesApi = {
  list: (conversationId: string) =>
    api.get<Message[]>(`/messages?conversation_id=eq.${conversationId}&order=created_at.asc`),
  post: (body: Omit<Message, 'id' | 'created_at'>) =>
    api.post<Message>('/messages', body),
}

// Knowledge Docs
export const knowledgeDocsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get<KnowledgeDoc[]>(`/knowledge_docs${qs}`)
  },
  indexed: () => api.get<KnowledgeDoc[]>(`/knowledge_docs?status=eq.indexed`),
}

// Daily Stats
export const dailyStatsApi = {
  today: () => api.get<DailyStats[]>(`/daily_stats?date=eq.today()`),
  byDate: (date: string) => api.get<DailyStats>(`/daily_stats?date=eq.${date}`),
}

// Chatbot Config
export const chatbotConfigApi = {
  get: (key: string) => api.get<ChatbotConfig>(`/chatbot_config?key=eq.${key}`),
  all: () => api.get<ChatbotConfig[]>('/chatbot_config'),
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
