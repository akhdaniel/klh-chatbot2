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

export default function Sidebar({ activeItem }: { activeItem: string }) {
  return (
    <aside style={{ background: 'linear-gradient(180deg, var(--leaf-deep) 0%, #082821 100%)', color: 'var(--leaf-light)', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
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
            <div key={item.id} style={{
              padding: '10px 24px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              color: activeItem === item.id ? 'white' : 'rgba(212,233,221,0.8)',
              background: activeItem === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: `3px solid ${activeItem === item.id ? 'var(--sun)' : 'transparent'}`,
            }}>
              <span style={{ width: 16, textAlign: 'center', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: 'var(--clay)', color: 'white', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 8 }}>{item.badge}</span>}
            </div>
          ))}
        </div>
      ))}
    </aside>
  )
}
