export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MessageSender = 'bot' | 'customer' | 'staff'
export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'closed'
export type KnowledgeDocStatus = 'processing' | 'indexed' | 'failed'

// Users / Staff & Admin
export interface User {
  id: number | string
  username: string
  password_hash: string
  display_name?: string
  avatar_initials?: string
  role: 'admin' | 'staff' | 'viewer'
  is_active?: boolean
  created_at: string
  updated_at?: string
}

// Customers / Pengguna WhatsApp
export interface Customer {
  id: number | string
  wa_phone: string
  wa_name?: string
  name?: string
  institution?: string
  city?: string
  is_anonymous?: boolean
  consent_given?: boolean
  consent_at?: string
  first_seen?: string
  last_active?: string
  total_chats?: number
  tags?: string[]
}

// Categories
export interface Category {
  id: number | string
  code: string
  name: string
  description?: string
  icon?: string
  color?: string
  is_active?: boolean
  sort_order: number
  created_at?: string
}

// Tickets / Tiket Pengaduan
export interface Ticket {
  id: number | string
  ticket_number: string
  customer_id?: number | string
  category_id?: number | string
  title?: string
  description?: string
  status: string
  priority?: TicketPriority
  source?: string
  assigned_to?: string | null
  location_lat?: number | null
  location_lng?: number | null
  location_name?: string
  resolved_at?: string
  closed_at?: string
  created_at: string
  updated_at?: string
}

// Ticket History / Riwayat Perubahan
export interface TicketHistory {
  id: number | string
  ticket_id: number | string
  old_status?: string | null
  new_status?: string | null
  changed_by?: string | null
  note?: string
  created_at: string
}

// Conversations / Sesi Percakapan
export interface Conversation {
  id: number | string
  customer_id: number | string
  ticket_id?: number | string | null
  wa_message_id?: string | null
  status: ConversationStatus
  channel: string
  started_at: string
  ended_at?: string | null
  message_count?: number
  metadata?: Record<string, any>
}

// Messages / Pesan
export interface Message {
  id: number | string
  conversation_id: number | string
  sender_type: MessageSender
  sender_id?: string | null
  content: string
  content_type?: string
  wa_message_id?: string | null
  metadata?: Record<string, any>
  created_at: string
}

// Knowledge Base / Dokumen Knowledge Base
export interface KnowledgeDoc {
  id: number | string
  title: string
  filename?: string | null
  file_type?: string | null
  file_size?: number | null
  content?: string | null
  category_id?: number | string
  status: KnowledgeDocStatus
  uploaded_by?: number | string
  source_url?: string | null
  tags?: string[]
  created_at: string
  updated_at?: string
}

// Chatbot Config
export interface ChatbotConfig {
  key: string
  value: any
  updated_at?: string
}

// Daily Stats / Statistik Harian
export interface DailyStats {
  id?: number | string
  date: string
  total_chats: number
  tickets: number
  bot_handled: number
  staff_handled: number
  resolved: number
  created_at?: string
}

// UI type for Ticket (transformed from DB)
export interface UITicket {
  id: string
  nomor: string
  judul: string
  preview: string
  status: TicketStatus
  kategori: string
  unit: string
  pelapor?: string
  nomor_hp?: string
  lokasi?: string
  lat?: number
  lng?: number
  sumber: 'whatsapp' | 'web'
  anonim: boolean
  created_at: string
  updated_at: string
  sla_jam?: number
}

// Summary types for dashboard
export interface TicketSummary {
  total_hari_ini: number
  open: number
  in_progress: number
  resolved: number
  closed: number
  avg_resolusi_jam: number
}

export interface ProvinceCount {
  lokasi: string
  jumlah: number
}

export interface CategoryStats {
  category_id: string
  category_name: string
  jumlah: number
}
