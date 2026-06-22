const KPI_MAJOR = [
  { label: 'Total Agenda Dihadiri', value: '142', delta: '▲ 18% vs target periodik', sub: 'dari 187 undangan yang masuk', warn: false, alert: false },
  { label: 'Tingkat Kehadiran', value: '76%', delta: '▲ 4% di atas rata-rata kabinet', sub: 'Delegasi: 38 agenda → Eselon I', warn: false, alert: false },
  { label: 'Skor Strategis Rata-rata', value: '81/100', delta: '▲ 12 poin bulan ini', sub: 'Tertimbang dampak & kategori', warn: true, alert: false },
  { label: 'Eksposur Media', value: '94%', delta: '▲ Sentimen positif 78%', sub: '12,847 pemberitaan terindeks', warn: false, alert: false },
]

const ESELON_BARS = [
  { label: 'Dirjen PPKL', pct: 92, color: '#d97706', val: '92%' },
  { label: 'Dirjen Gakkum', pct: 88, color: '#c97050', val: '88%' },
  { label: 'Dirjen PPI (Iklim)', pct: 84, color: '#7c3aed', val: '84%' },
  { label: 'Dirjen KSDAE', pct: 79, color: '#2d8068', val: '79%' },
  { label: 'Dirjen PSLB3', pct: 71, color: '#0891b2', val: '71%' },
  { label: 'Dirjen Planologi', pct: 68, color: '#65a30d', val: '68%' },
  { label: 'Sekjen', pct: 62, color: '#6b7280', val: '62%' },
]

export default function KpiPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          Dashboard KPI <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Agenda & Kinerja Pejabat</em>
        </h3>
        <span style={{ fontSize: 12, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace' }}>Periode: 27 April – 25 Mei 2026</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {KPI_MAJOR.map(k => (
          <div key={k.label} style={{ background: 'white', border: '1px solid var(--line)', padding: '18px 20px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: k.warn ? 'var(--sun)' : k.alert ? 'var(--clay)' : 'var(--leaf-mid)' }} />
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 500, color: 'var(--leaf-deep)', lineHeight: 1, letterSpacing: '-0.02em' }}>{k.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 8, color: 'var(--leaf-mid)' }}>{k.delta}</div>
            <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)', marginTop: 28 }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          Kinerja per Pejabat <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Eselon I</em>
        </h3>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--line)', padding: '18px 22px' }}>
        {ESELON_BARS.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ width: 160, fontSize: 12, color: 'var(--bark)', fontWeight: 500 }}>{b.label}</span>
            <div style={{ flex: 1, height: 14, background: 'var(--line-soft)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 2, transition: 'width 0.6s' }} />
            </div>
            <span style={{ width: 50, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{b.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
