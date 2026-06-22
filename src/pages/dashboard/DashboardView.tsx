import { useState, useEffect } from 'react'
import type { UITicket } from '../../types'
import { ticketsApi } from '../../api/pgrest'
import Sidebar from '../../components/Sidebar'
import TicketList from './TicketList'
import TicketDetail from './TicketDetail'
import KpiRow from './KpiRow'
import FilterBar from './FilterBar'
import UploadModal from './UploadModal'

const FILTERS = [
  { label: 'Semua', count: 0, value: '' },
  { label: 'Pengaduan', count: 0, value: 'pengaduan' },
  { label: 'Karhutla', count: 0, value: 'karhutla' },
  { label: 'Carbon Credit', count: 0, value: 'carbon_credit' },
  { label: 'Persuratan', count: 0, value: 'persuratan' },
  { label: 'Hoax', count: 0, value: 'hoax' },
]

export default function DashboardView() {
  const [selected, setSelected] = useState<UITicket | null>(null)
  const [filter, setFilter] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [tickets, setTickets] = useState<UITicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch from BFF API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        // Fetch from BFF with pagination
        const response = await ticketsApi.list({ limit: 50 })
        const data = Array.isArray(response) ? response : response.data || []
        // Transform database tickets to UI format
        const transformed = data.map(t => ({
          id: String(t.id),
          nomor: t.ticket_number,
          judul: t.title || `Tiket ${t.ticket_number}`,
          preview: t.description ? t.description.substring(0, 60) + (t.description.length > 60 ? '...' : '') : `Lokasi: ${t.location_name || 'Tidak tersedia'}`,
          status: t.status === 'pending' ? 'open' : t.status === 'in_progress' ? 'in_progress' : t.status === 'resolved' ? 'resolved' : 'closed' as any,
          kategori: 'pengaduan' as const,
          unit: 'KLH',
          pelapor: undefined,
          nomor_hp: undefined,
          lokasi: t.location_name,
          lat: t.location_lat || undefined,
          lng: t.location_lng || undefined,
          sumber: (t.source === 'telegram' || t.source === 'whatsapp' ? t.source : 'whatsapp') as 'whatsapp' | 'web',
          anonim: false,
          created_at: t.created_at,
          updated_at: t.updated_at || t.created_at,
          sla_jam: 2,
        }))
        setTickets(transformed)
        if (transformed.length > 0) setSelected(transformed[0])
        setError(null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal fetch tickets'
        setError(msg)
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const filtered = filter ? tickets.filter(t => t.kategori === filter) : tickets

  if (loading) {
    return (
      <div style={{ border: '1.5px solid var(--ink)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', height: 820, boxShadow: '0 20px 50px rgba(13,59,46,0.12)', background: 'var(--paper)' }}>
        <Sidebar activeItem="tiket" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--bark-soft)' }}>
          Loading data dari pgREST...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ border: '1.5px solid var(--ink)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', height: 820, boxShadow: '0 20px 50px rgba(13,59,46,0.12)', background: 'var(--paper)' }}>
        <Sidebar activeItem="tiket" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--clay)', padding: 20, textAlign: 'center' }}>
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ border: '1.5px solid var(--ink)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', height: 820, boxShadow: '0 20px 50px rgba(13,59,46,0.12)', background: 'var(--paper)' }}>
      <Sidebar activeItem="tiket" />
      <div style={{ background: 'var(--paper)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 5 }}>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 22, color: 'var(--leaf-deep)' }}>
              Tiket Percakapan <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontWeight: 400 }}>· Real-time</em>
            </h2>
            <div style={{ fontSize: 12, color: 'var(--bark-soft)', marginTop: 2 }}>
              Total {tickets.length} tiket · Sinkron aktif dari pgREST
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', border: '1px solid var(--line)', borderRadius: 999 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--leaf-mid), var(--leaf-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600 }}>SR</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Siti Rahmawati</div>
              <div style={{ fontSize: 10, color: 'var(--bark-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Humas · Ditjen PPKL</div>
            </div>
          </div>
        </div>

        <KpiRow />
        <FilterBar filters={FILTERS} active={filter} onChange={setFilter} onUpload={() => setShowUpload(true)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', flex: 1, minHeight: 0 }}>
          <div style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 24px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-soft)' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500 }}>Daftar Tiket ({filtered.length})</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--bark-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Urut · Terbaru ↓</span>
            </div>
            <TicketList tickets={filtered} selected={selected} onSelect={setSelected} />
          </div>
          {selected && <TicketDetail ticket={selected} />}
        </div>
      </div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
