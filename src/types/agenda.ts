export interface Agenda {
  id: number
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'confirmed' | 'scheduled' | 'delegated' | 'completed' | 'cancelled'
  category: 'kenegaraan' | 'internasional' | 'koordinasi' | 'publik' | 'protokoler' | 'internal'
  delegation_to?: string | null
  kpi_score?: number
  is_kpi?: boolean
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
