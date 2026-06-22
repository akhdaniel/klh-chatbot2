import { useState } from 'react'
import './index.css'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import MobileView from './pages/mobile/MobileView'
import DashboardView from './pages/dashboard/DashboardView'
import MapView from './pages/map/MapView'
import MinisterView from './pages/minister/MinisterView'

type View = 'mobile' | 'dashboard' | 'map' | 'minister'

const VIEWS: { id: View; label: string }[] = [
  { id: 'mobile', label: '📱 Mobile · Pengguna' },
  { id: 'dashboard', label: '🖥 Dashboard · Tiket' },
  { id: 'map', label: '🗺 Peta Sebaran' },
  { id: 'minister', label: '👔 Agenda & Capaian Menteri' },
]

export default function App() {
  const { isLoggedIn, user, logout } = useAuth()
  const [activeView, setActiveView] = useState<View>('mobile')

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onSuccess={() => setActiveView('dashboard')} />
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', padding: '24px 16px 80px' }}>
      <header style={{
        maxWidth: 1400, margin: '0 auto 32px', padding: '28px 32px',
        border: '1.5px solid var(--ink)',
        background: 'linear-gradient(135deg, #faf8f3 0%, #f0ede3 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, var(--leaf-light), transparent 70%)',
          opacity: 0.5, pointerEvents: 'none',
        }} />
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em',
            color: 'var(--leaf)', textTransform: 'uppercase', marginBottom: 8,
          }}>⬢ Kementerian Lingkungan Hidup RI</div>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontWeight: 500,
            fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.05, letterSpacing: '-0.02em',
            color: 'var(--leaf-deep)', marginBottom: 6,
          }}>
            WhatsApp Chatbot AI{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--clay)' }}>&</em>
            {' '}Dashboard Pengelola
          </h1>
          <p style={{ fontSize: 14, color: 'var(--bark-soft)', maxWidth: 600 }}>
            Prototype interaktif — layanan publik berbasis WhatsApp otomatis 24 jam dengan back-office terpusat untuk Humas KLH.
          </p>
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative', minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', border: '1px solid var(--line)', borderRadius: 999 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--leaf-mid), var(--leaf-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600 }}>
              {user?.avatar_initials || user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{user?.display_name || user?.username}</div>
              <div style={{ fontSize: 10, color: 'var(--bark-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6,
              background: 'white', border: '1px solid var(--line)', borderRadius: 6,
              padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: 'var(--clay)', minWidth: 120, textAlign: 'center',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{
        maxWidth: 1400, margin: '0 auto 32px', display: 'flex', justifyContent: 'center',
        border: '1.5px solid var(--ink)', background: 'var(--paper)',
        width: 'fit-content', padding: 4,
      }}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)} style={{
            background: activeView === v.id ? 'var(--ink)' : 'transparent',
            color: activeView === v.id ? 'var(--paper)' : 'var(--bark-soft)',
            border: 'none', padding: '12px 28px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 600, transition: 'all 0.25s ease',
          }}>{v.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto' }} className="animate-fadeUp">
        {activeView === 'mobile' && <MobileView />}
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'map' && <MapView />}
        {activeView === 'minister' && <MinisterView />}
      </div>
    </div>
  )
}
