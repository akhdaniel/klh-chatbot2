export interface Agenda {
  id: number
  title: string
  description?: string
  date: string              // Frontend menggunakan 'date'
  agenda_date?: string      // API return 'agenda_date'
  agenda_time?: string      // API return 'agenda_time'
  time?: string
  location?: string
  priority: 'critical' | 'high' | 'medium' | 'low' | 'delegate'
  status: 'confirmed' | 'scheduled' | 'delegated' | 'completed' | 'cancelled' | 'draft' | 'pending' | 'open'
  category: 'kenegaraan' | 'internasional' | 'koordinasi' | 'publik' | 'protokoler' | 'internal' | 'state' | 'public' | 'coordination' | 'protocol'
  delegation_to?: string | null
  kpi_score?: number
  is_kpi?: boolean
  date_formatted?: {
    day_number: number
    day_name: string
    month_name: string
    year: number
    formatted: string
    iso: string
  }
  created_at: string
  updated_at?: string
}

export interface Achievement {
  id: string | number
  title: string
  description?: string
  date: string
  category: 'penghargaan' | 'pencapaian' | 'inisiatif'
  impact?: string
  created_at: string
  updated_at?: string
}

export interface MinisterProfileUpdate {
  display_name?: string
  bio?: string
  avatar_url?: string
}
