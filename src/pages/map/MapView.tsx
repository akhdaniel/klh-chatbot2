import { useState, useEffect } from 'react'
import { ticketsApi } from '../../api/pgrest'
import type { Ticket } from '../../types'
import Sidebar from '../../components/Sidebar'
import InteractiveMap from './InteractiveMap'
import StatsPanel from './StatsPanel'

export default function MapView() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await ticketsApi.list({ limit: 100 })
        const data = Array.isArray(response) ? response : response.data || []
        setTickets(data)
      } catch (err) {
        console.error('Failed to fetch tickets:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  if (loading) {
    return (
      <div style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', height: 880, boxShadow: '0 20px 50px rgba(13,59,46,0.12)' }}>
        <Sidebar activeItem="peta" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--bark-soft)' }}>
          Loading map data...
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', height: 880, boxShadow: '0 20px 50px rgba(13,59,46,0.12)' }}>
      <Sidebar activeItem="peta" />
      <div style={{ background: 'var(--paper)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 22, color: 'var(--leaf-deep)' }}>
              Peta Sebaran <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontWeight: 400 }}>· Pengaduan & Pelaporan</em>
            </h2>
            <div style={{ fontSize: 12, color: 'var(--bark-soft)', marginTop: 2 }}>Real-time · {tickets.length} titik aktif · Sinkron dari pgREST</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', border: '1px solid var(--line)', borderRadius: 999 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--leaf-mid), var(--leaf-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600 }}>SR</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Siti Rahmawati</div>
              <div style={{ fontSize: 10, color: 'var(--bark-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Humas</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <InteractiveMap tickets={tickets} />
          <StatsPanel tickets={tickets} />
        </div>
      </div>
    </div>
  )
}
