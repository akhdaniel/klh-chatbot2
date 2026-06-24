import { useState, useEffect } from 'react'
import type { UITicket, Message } from '../../types'
import { ticketsApi, chatApi } from '../../api/pgrest'
import Sidebar, { HamburgerButton } from '../../components/Sidebar'
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

// Hook untuk cek mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

export default function DashboardView() {
  const [selected, setSelected] = useState<UITicket | null>(null)
  const [filter, setFilter] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [tickets, setTickets] = useState<UITicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Conversation history states
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  
  const isMobile = useIsMobile()

  // Fetch tickets on mount (tanpa history)
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await ticketsApi.list({ limit: 50 })
        const data = Array.isArray(response) ? response : response.data || []
        
        // Transform database tickets to UI format (tanpa history)
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
          conversation_id: t.id, // Simpan conversation_id untuk fetch history nanti
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

  // Fetch conversation history saat ticket dipilih
  useEffect(() => {
    if (!selected?.conversation_id) {
      setConversationHistory([])
      return
    }

    const fetchHistory = async () => {
      if (!selected.conversation_id) {
        setConversationHistory([])
        return
      }
      
      setHistoryLoading(true)
      setHistoryError(null)
      
      try {
        const response = await chatApi.getHistory(selected.conversation_id, 50)
        if (response.ok && response.data) {
          setConversationHistory(response.data)
        } else {
          setConversationHistory([])
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal load history'
        setHistoryError(msg)
        console.error('History fetch error:', err)
        setConversationHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [selected?.conversation_id])

  const filtered = filter ? tickets.filter(t => t.kategori === filter) : tickets

  if (loading) {
    return (
      <div style={{ 
        border: '1.5px solid var(--ink)', 
        overflow: 'hidden', 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', 
        height: isMobile ? 'calc(100vh - 140px)' : 820, 
        boxShadow: '0 20px 50px rgba(13,59,46,0.12)', 
        background: 'var(--paper)' 
      }}>
        {!isMobile && <Sidebar activeItem="tiket" />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--bark-soft)' }}>
          Loading data dari pgREST...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        border: '1.5px solid var(--ink)', 
        overflow: 'hidden', 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', 
        height: isMobile ? 'calc(100vh - 140px)' : 820, 
        boxShadow: '0 20px 50px rgba(13,59,46,0.12)', 
        background: 'var(--paper)' 
      }}>
        {!isMobile && <Sidebar activeItem="tiket" />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--clay)', padding: 20, textAlign: 'center' }}>
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      border: '1.5px solid var(--ink)', 
      overflow: 'hidden', 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', 
      height: isMobile ? 'calc(100vh - 140px)' : 820, 
      boxShadow: '0 20px 50px rgba(13,59,46,0.12)', 
      background: 'var(--paper)' 
    }}>
      {/* Mobile Sidebar with overlay */}
      <Sidebar 
        activeItem="tiket" 
        isOpen={isMobile ? sidebarOpen : undefined}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div style={{ background: 'var(--paper)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ 
          padding: isMobile ? '12px 16px' : '18px 28px', 
          borderBottom: '1px solid var(--line)', 
          display: 'flex',
          alignItems: 'center',
          background: 'white', 
          position: 'sticky', 
          top: 0, 
          zIndex: 5 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger button for mobile */}
            {isMobile && (
              <HamburgerButton onClick={() => setSidebarOpen(true)} />
            )}
            <div>
              <h2 style={{ 
                fontFamily: 'Fraunces, serif', 
                fontWeight: 500, 
                fontSize: isMobile ? 18 : 22, 
                color: 'var(--leaf-deep)' 
              }}>
                Tiket Percakapan <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontWeight: 400 }}>· Real-time</em>
              </h2>
              <div style={{ fontSize: isMobile ? 11 : 12, color: 'var(--bark-soft)', marginTop: 2 }}>
                Total {tickets.length} tiket · Sinkron aktif dari pgREST
              </div>
            </div>
          </div>
        </div>

        <KpiRow />
        <FilterBar filters={FILTERS} active={filter} onChange={setFilter} onUpload={() => setShowUpload(true)} />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', 
          flex: 1, 
          minHeight: 0 
        }}>
          <div style={{ 
            borderRight: isMobile ? 'none' : '1px solid var(--line)', 
            display: 'flex', 
            flexDirection: 'column',
            borderBottom: isMobile ? '1px solid var(--line)' : 'none'
          }}>
            <div style={{ 
              padding: isMobile ? '12px 16px 8px' : '14px 24px 10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              borderBottom: '1px solid var(--line-soft)' 
            }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? 14 : 16, fontWeight: 500 }}>
                Daftar Tiket ({filtered.length})
              </span>
              <span style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: isMobile ? 9 : 10, 
                color: 'var(--bark-soft)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em' 
              }}>
                Urut · Terbaru ↓
              </span>
            </div>
            <TicketList tickets={filtered} selected={selected} onSelect={setSelected} />
          </div>
          
          {/* Ticket Detail - Full screen on mobile when selected */}
          {selected && (
            <div style={{
              display: isMobile ? (selected ? 'block' : 'none') : 'block',
              position: isMobile ? 'fixed' : 'relative',
              top: isMobile ? 0 : 'auto',
              left: isMobile ? 0 : 'auto',
              right: isMobile ? 0 : 'auto',
              bottom: isMobile ? 0 : 'auto',
              zIndex: isMobile ? 100 : 'auto',
              background: 'var(--paper)',
            }}>
              {isMobile && (
                <button 
                  onClick={() => setSelected(null)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 101,
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  ← Kembali
                </button>
              )}
              <TicketDetail 
                ticket={selected} 
                conversationHistory={conversationHistory}
                historyLoading={historyLoading}
                historyError={historyError}
              />
            </div>
          )}
        </div>
      </div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
