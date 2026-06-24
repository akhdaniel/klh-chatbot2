import { useState, useEffect } from 'react'

const NAV = [
  { section: 'Operasional', items: [
    { id: 'tiket', icon: '◆', label: 'Tiket Percakapan', badge: 24 },
    { id: 'live', icon: '▶', label: 'Percakapan Live' },
    { id: 'eskalasi', icon: '⚑', label: 'Eskalasi', badge: 3 },
  ]},
  { section: 'Knowledge Base', items: [
    { id: 'sumber', icon: '⬢', label: 'Sumber Data' },
    { id: 'regulasi', icon: '§', label: 'Regulasi & Juknis' },
    { id: 'faq', icon: '⚐', label: 'FAQ Terkurasi' },
  ]},
  { section: 'Analisis', items: [
    { id: 'statistik', icon: '▲', label: 'Statistik' },
    { id: 'kategori', icon: '◐', label: 'Kategori' },
    { id: 'peta', icon: '⚲', label: 'Lokasi Pelapor' },
  ]},
  { section: 'Pengaturan', items: [
    { id: 'tim', icon: '⚙', label: 'Tim & Unit Kerja' },
    { id: 'akses', icon: '🛡', label: 'Akses & Audit' },
  ]},
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

interface SidebarProps {
  activeItem: string
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ activeItem, isOpen, onClose }: SidebarProps) {
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Controlled by parent or internal state
  const menuOpen = isOpen !== undefined ? isOpen : mobileOpen
  const handleClose = onClose || (() => setMobileOpen(false))
  
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [menuOpen, handleClose])
  
  const sidebarContent = (
    <>
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(212,233,221,0.1)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: 'var(--sun)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--leaf-deep)', fontSize: 16 }}>⬢</div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 17, color: 'white' }}>KLH Console</div>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,233,221,0.6)', fontFamily: 'JetBrains Mono, monospace' }}>v 1.0 · Humas</div>
          </div>
        </div>
      </div>

      {NAV.map(group => (
        <div key={group.section}>
          <div style={{ padding: '12px 16px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,233,221,0.4)' }}>{group.section}</div>
          {group.items.map(item => (
            <div 
              key={item.id} 
              onClick={handleClose}
              style={{
                padding: '10px 24px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                color: activeItem === item.id ? 'white' : 'rgba(212,233,221,0.8)',
                background: activeItem === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: `3px solid ${activeItem === item.id ? 'var(--sun)' : 'transparent'}`,
              }}
            >
              <span style={{ width: 16, textAlign: 'center', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: 'var(--clay)', color: 'white', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 8 }}>{item.badge}</span>}
            </div>
          ))}
        </div>
      ))}
    </>
  )
  
  // Mobile: overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {menuOpen && (
          <div 
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 98,
            }}
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside 
          style={{
            position: 'fixed',
            top: 0,
            left: menuOpen ? 0 : '-280px',
            width: 260,
            height: '100vh',
            background: 'linear-gradient(180deg, var(--leaf-deep) 0%, #082821 100%)',
            color: 'var(--leaf-light)',
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99,
            transition: 'left 0.3s ease',
            boxShadow: menuOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {sidebarContent}
        </aside>
      </>
    )
  }
  
  // Desktop: static sidebar
  return (
    <aside style={{ background: 'linear-gradient(180deg, var(--leaf-deep) 0%, #082821 100%)', color: 'var(--leaf-light)', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
      {sidebarContent}
    </aside>
  )
}

// Hamburger button component
export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '8px 10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ width: 18, height: 2, background: 'var(--ink)', borderRadius: 1 }} />
      <span style={{ width: 18, height: 2, background: 'var(--ink)', borderRadius: 1 }} />
      <span style={{ width: 18, height: 2, background: 'var(--ink)', borderRadius: 1 }} />
    </button>
  )
}
