export interface Agenda {
  id: string | number
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  category?: 'pertemuan' | 'kunjungan' | 'seminar' | 'lainnya'
  created_by?: string | number
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
