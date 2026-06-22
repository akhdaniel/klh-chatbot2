const TIME_RANGES = ['24J', '7H', '30H', '90H', 'YTD']

const LAYERS = [
  { id: 'ppkl', color: '#d97706', name: 'Ditjen PPKL', count: 487 },
  { id: 'gakkum', color: '#c97050', name: 'Ditjen Gakkum', count: 312 },
  { id: 'ksdae', color: '#2d8068', name: 'Ditjen KSDAE', count: 298 },
  { id: 'ppi', color: '#7c3aed', name: 'Ditjen PPI', count: 241 },
  { id: 'pslb3', color: '#0891b2', name: 'Ditjen PSLB3', count: 189 },
  { id: 'planologi', color: '#65a30d', name: 'Planologi Kehutanan', count: 156 },
  { id: 'balai', color: '#e8b341', name: 'Balai TN / UPT', count: 164 },
]

const CATEGORIES = [
  { name: 'Pencemaran Air', count: 342 },
  { name: 'Pencemaran Udara', count: 198 },
  { name: 'Karhutla', count: 87 },
  { name: 'Limbah B3', count: 156 },
  { name: 'Perambahan Hutan', count: 124 },
  { name: 'Satwa Dilindungi', count: 89 },
]

const STATUS_LEGEND = [
  { color: '#d97706', label: 'Open · 487' },
  { color: '#2563eb', label: 'In Progress · 612' },
  { color: '#059669', label: 'Resolved · 524' },
  { color: '#6b7280', label: 'Closed · 224' },
]

export default function LayerPanel({ timeRange, onTimeRange }: { timeRange: string; onTimeRange: (t: string) => void }) {
  return (
    <div style={{ borderRight: '1px solid var(--line)', background: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Time filter */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 10 }}>Filter Waktu</div>
        <div style={{ display: 'flex', gap: 4, padding: 3, border: '1px solid var(--line)', background: 'white', width: 'fit-content' }}>
          {TIME_RANGES.map(t => (
            <button key={t} onClick={() => onTimeRange(t)} style={{ background: timeRange === t ? 'var(--ink)' : 'transparent', color: timeRange === t ? 'var(--paper)' : 'var(--bark-soft)', border: 'none', padding: '4px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Layer instansi */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>Layer · Instansi</span>
          <span style={{ color: 'var(--leaf-mid)', cursor: 'pointer', textDecoration: 'underline', fontSize: 9 }}>semua</span>
        </div>
        {LAYERS.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer' }}>
            <div style={{ width: 14, height: 14, border: '1.5px solid var(--ink)', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--paper)', flexShrink: 0, borderRadius: 2 }}>✓</div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, flexShrink: 0, border: '1.5px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }} />
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{l.name}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--bark-soft)', fontWeight: 600 }}>{l.count}</span>
          </div>
        ))}
      </div>

      {/* Kategori */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 10 }}>Kategori Pengaduan</div>
        {CATEGORIES.map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer' }}>
            <div style={{ width: 14, height: 14, border: '1.5px solid var(--ink)', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--paper)', flexShrink: 0, borderRadius: 2 }}>✓</div>
            <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{c.name}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--bark-soft)', fontWeight: 600 }}>{c.count}</span>
          </div>
        ))}
      </div>

      {/* Status legend */}
      <div style={{ padding: '16px 20px 14px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 10 }}>Status Tiket</div>
        {STATUS_LEGEND.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--bark)', marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}
