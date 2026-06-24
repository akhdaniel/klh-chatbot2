import { useState, useEffect } from 'react'
import { ticketsApi } from '../../api/pgrest'
import type { Ticket } from '../../types'
import Sidebar, { HamburgerButton } from '../../components/Sidebar'
import InteractiveMap from './InteractiveMap'
import StatsPanel from './StatsPanel'

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

export default function MapView() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

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
      <div style={{ 
        background: 'var(--paper)', 
        border: '1.5px solid var(--ink)', 
        overflow: 'hidden', 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', 
        height: isMobile ? 'calc(100vh - 140px)' : 880, 
        boxShadow: '0 20px 50px rgba(13,59,46,0.12)' 
      }}>
        {!isMobile && <Sidebar activeItem="peta" />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--bark-soft)' }}>
          Loading map data...
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      background: 'var(--paper)', 
      border: '1.5px solid var(--ink)', 
      overflow: 'hidden', 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', 
      height: isMobile ? 'calc(100vh - 140px)' : 880, 
      boxShadow: '0 20px 50px rgba(13,59,46,0.12)' 
    }}>
      {/* Mobile Sidebar with overlay */}
      <Sidebar 
        activeItem="peta" 
        isOpen={isMobile ? sidebarOpen : undefined}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div style={{ 
        background: 'var(--paper)', 
        overflow: isMobile ? 'auto' : 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Topbar */}
        <div style={{ 
          padding: isMobile ? '12px 16px' : '18px 28px', 
          borderBottom: '1px solid var(--line)', 
          display: 'flex', 
          alignItems: 'center', 
          background: 'white', 
          flexShrink: 0,
          gap: 12
        }}>
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
              Peta Sebaran <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontWeight: 400 }}>· Pengaduan & Pelaporan</em>
            </h2>
            <div style={{ fontSize: isMobile ? 11 : 12, color: 'var(--bark-soft)', marginTop: 2 }}>
              Real-time · {tickets.length} titik aktif · Sinkron dari pgREST
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isMobile ? (
          /* Mobile: Vertical layout - Map on top, Stats below (scrollable) */
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            flex: 1,
            overflow: 'auto'
          }}>
            {/* Map on top */}
            <div style={{ 
              height: '50vh', 
              minHeight: 300,
              flexShrink: 0 
            }}>
              <InteractiveMap tickets={tickets} />
            </div>
            
            {/* Stats panel below (scrollable) */}
            <div style={{ 
              flex: 1,
              minHeight: 0,
              borderTop: '1px solid var(--line)'
            }}>
              <StatsPanel tickets={tickets} />
            </div>
          </div>
        ) : (
          /* Desktop: Side by side layout */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 320px', 
            flex: 1, 
            minHeight: 0, 
            overflow: 'hidden' 
          }}>
            <InteractiveMap tickets={tickets} />
            <StatsPanel tickets={tickets} />
          </div>
        )}
      </div>
    </div>
  )
}
