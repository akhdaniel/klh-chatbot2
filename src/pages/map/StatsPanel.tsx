import type { Ticket } from '../../types'

const DEFAULT_INSTANSI_BARS = [
  { label: 'PPKL', pct: 100, color: '#d97706', count: 487 },
  { label: 'Gakkum', pct: 64, color: '#c97050', count: 312 },
  { label: 'KSDAE', pct: 61, color: '#2d8068', count: 298 },
  { label: 'PPI', pct: 49, color: '#7c3aed', count: 241 },
  { label: 'PSLB3', pct: 39, color: '#0891b2', count: 189 },
  { label: 'Balai/UPT', pct: 34, color: '#e8b341', count: 164 },
  { label: 'Planologi', pct: 32, color: '#65a30d', count: 156 },
]

const TOP_PROVINCES = [
  ['Jawa Barat', '312 kasus'], ['Riau', '241 kasus'], ['Jawa Timur', '198 kasus'],
  ['Kalimantan Tengah', '187 kasus'], ['Sumatra Selatan', '152 kasus'],
]

export default function StatsPanel({ tickets }: { tickets: Ticket[] }) {
  // Compute statistics from tickets
  const totalTickets = tickets.length
  const pendingCount = tickets.filter(t => t.status === 'pending').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length
  const closedCount = tickets.filter(t => t.status === 'closed').length

  // Compute donut segments with real data
  const total = totalTickets || 1
  const donutSegments = [
    { color: '#d97706', label: 'Pending', count: pendingCount, dash: Math.round((pendingCount / total) * 100), offset: 0 },
    { color: '#2563eb', label: 'In Progress', count: inProgressCount, dash: Math.round((inProgressCount / total) * 100), offset: -Math.round((pendingCount / total) * 100) },
    { color: '#059669', label: 'Resolved', count: resolvedCount, dash: Math.round((resolvedCount / total) * 100), offset: -Math.round(((pendingCount + inProgressCount) / total) * 100) },
    { color: '#6b7280', label: 'Closed', count: closedCount, dash: Math.round((closedCount / total) * 100), offset: -Math.round(((pendingCount + inProgressCount + resolvedCount) / total) * 100) },
  ]
  return (
    <div style={{ background: 'var(--paper)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Total */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 12 }}>Total Pengaduan · Aktif</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, color: 'var(--leaf-deep)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {totalTickets} <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontSize: 18, fontWeight: 400, marginLeft: 4 }}>kasus</em>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--bark-soft)', marginBottom: 12 }}>Data real-time dari pgREST</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--leaf-mid)' }}>Sinkron aktif</div>
      </div>

      {/* Donut */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 12 }}>Sebaran per Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="30" fill="none" stroke="#ebe7da" strokeWidth="14"/>
            {donutSegments.map(s => (
              <circle key={s.label} cx="40" cy="40" r="30" fill="none" stroke={s.color} strokeWidth="14"
                strokeDasharray={`${s.dash},200`} strokeDashoffset={s.offset} transform="rotate(-90 40 40)"/>
            ))}
          </svg>
          <div style={{ flex: 1 }}>
            {donutSegments.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--bark)', flex: 1 }}>{s.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--ink)' }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per instansi bars */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 12 }}>Pengaduan per Instansi</div>
        {DEFAULT_INSTANSI_BARS.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 90, color: 'var(--bark)', fontWeight: 500, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</span>
            <div style={{ flex: 1, height: 12, background: 'var(--line-soft)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 2, transition: 'width 0.6s' }} />
            </div>
            <span style={{ width: 36, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, fontWeight: 600, color: 'var(--ink)' }}>{b.count}</span>
          </div>
        ))}
      </div>

      {/* Top provinces */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 12 }}>Top 5 · Provinsi Pengadu</div>
        {TOP_PROVINCES.map(([place, num], i) => (
          <div key={place} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px dashed var(--line-soft)' : 'none', fontSize: 12 }}>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--clay)', fontWeight: 700, marginRight: 6, fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
              {place}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--bark-soft)' }}>{num}</span>
          </div>
        ))}
      </div>

      {/* Hotspot */}
      <div style={{ padding: '18px 22px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', fontWeight: 700, marginBottom: 12 }}>Hotspot Kritis · 24 jam</div>
        {[['🔥', 'Pelalawan, Riau', 'karhutla', '#c97050'], ['⚠', 'Karawang, Jabar', 'sungai', '#d97706'], ['🔥', 'Palangkaraya', 'titik api', '#c97050']].map(([icon, place, type, color]) => (
          <div key={place} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--line-soft)', fontSize: 12 }}>
            <span style={{ color: color as string, fontWeight: 500 }}><span style={{ marginRight: 6 }}>{icon}</span>{place}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--bark-soft)' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
