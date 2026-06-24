import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { path: '/mobile', label: '📱 Mobile', shortLabel: '📱' },
  { path: '/dashboard', label: '🖥 Dashboard', shortLabel: '🖥' },
  { path: '/map', label: '🗺 Peta', shortLabel: '🗺' },
  { path: '/minister', label: '👔 Menteri', shortLabel: '👔' },
]

// Hook untuk cek mobile viewport
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

export default function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isMobile = useIsMobile()
  const activePath = location.pathname

  return (
    <div style={{ 
      background: 'var(--paper)', 
      minHeight: '100vh',
      padding: isMobile ? '12px 8px 80px' : '24px 16px 80px'
    }}>
      {/* Header */}
      <header style={{
        maxWidth: 1400, 
        margin: `0 auto ${isMobile ? '16px' : '32px'}`, 
        padding: isMobile ? '16px 12px' : '28px 32px',
        border: '1.5px solid var(--ink)',
        background: 'linear-gradient(135deg, #faf8f3 0%, #f0ede3 100%)',
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'center' : 'flex-start',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', 
          top: isMobile ? -20 : -40, 
          right: isMobile ? -20 : -40, 
          width: isMobile ? 100 : 200, 
          height: isMobile ? 100 : 200,
          borderRadius: '50%', 
          background: 'radial-gradient(circle, var(--leaf-light), transparent 70%)',
          opacity: 0.5, 
          pointerEvents: 'none',
        }} />
        
        {/* Logo & Title */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: isMobile ? 9 : 11, 
            letterSpacing: '0.2em',
            color: 'var(--leaf)', 
            textTransform: 'uppercase', 
            marginBottom: isMobile ? 4 : 8,
          }}>⬢ KLH RI</div>
          <h1 style={{
            fontFamily: 'Fraunces, serif', 
            fontWeight: 500,
            fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 'clamp(28px, 4vw, 44px)', 
            lineHeight: 1.1, 
            letterSpacing: '-0.02em',
            color: 'var(--leaf-deep)', 
            marginBottom: isMobile ? 4 : 6,
          }}>
            WhatsApp Chatbot{' '}
            {isMobile ? <br /> : ''}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--clay)' }}>&</em>
            {' '}Dashboard
          </h1>
          {!isMobile && (
            <p style={{ fontSize: 14, color: 'var(--bark-soft)', maxWidth: 600 }}>
              Prototype interaktif — layanan publik berbasis WhatsApp otomatis 24 jam.
            </p>
          )}
        </div>

        {/* User Menu */}
        <div style={{ 
          position: 'relative', 
          minWidth: isMobile ? 'auto' : 200,
          width: isMobile ? '100%' : 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            padding: '6px 14px 6px 6px', 
            border: '1px solid var(--line)', 
            borderRadius: 999,
            justifyContent: isMobile ? 'space-between' : 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--leaf-mid), var(--leaf-deep))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: 12, 
                fontWeight: 600 
              }}>
                {user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                  {user?.display_name || user?.username}
                </div>
                <div style={{ fontSize: 10, color: 'var(--bark-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.role}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid var(--clay)',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--clay)',
              }}
            >
              {isMobile ? '✕' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      {!isMobile && (
        <nav style={{
          maxWidth: 1400, 
          margin: '0 auto 32px', 
          display: 'flex', 
          justifyContent: 'center',
          border: '1.5px solid var(--ink)', 
          background: 'var(--paper)',
          width: 'fit-content', 
          padding: 4,
        }}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                background: activePath === item.path ? 'var(--ink)' : 'transparent',
                color: activePath === item.path ? 'var(--paper)' : 'var(--bark-soft)',
                border: 'none', 
                padding: '12px 28px',
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: 11,
                letterSpacing: '0.15em', 
                textTransform: 'uppercase',
                cursor: 'pointer', 
                fontWeight: 600, 
                transition: 'all 0.25s ease',
                textDecoration: 'none', 
                display: 'inline-block',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Mobile Navigation - Bottom Bar */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--paper)',
          borderTop: '1.5px solid var(--ink)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                background: activePath === item.path ? 'var(--ink)' : 'transparent',
                color: activePath === item.path ? 'var(--paper)' : 'var(--bark-soft)',
                border: 'none', 
                padding: '10px 16px',
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: 10,
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                cursor: 'pointer', 
                fontWeight: 600, 
                transition: 'all 0.25s ease',
                textDecoration: 'none', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                borderRadius: activePath === item.path ? '8px' : '0',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.shortLabel}</span>
              <span>{item.label.split(' ')[1]}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main style={{ 
        maxWidth: 1400, 
        margin: '0 auto',
        paddingBottom: isMobile ? '80px' : '0'
      }} className="animate-fadeUp">
        <Outlet />
      </main>
    </div>
  )
}
