const COMPARE_DATA = [
  { label: 'Indeks Kualitas Lingkungan Hidup (IKLH)', ctx: 'Skor komposit nasional', before: { yr: 'Pra 2026', val: '71.2', unit: '/100', pct: 71 }, after: { yr: 'Target 2026', val: '76.5', unit: '/100', pct: 76 }, down: false },
  { label: 'Indeks Kualitas Air Sungai', ctx: '52 sungai prioritas nasional', before: { yr: '2024', val: '53.8', unit: '/100', pct: 54 }, after: { yr: '2026 (Q1)', val: '61.4', unit: '/100', pct: 61 }, down: false },
  { label: 'Indeks Kualitas Udara (IKU)', ctx: 'PM2.5, NOx, SO2 di 514 kab/kota', before: { yr: '2024', val: '84.6', unit: '/100', pct: 84 }, after: { yr: '2026 (Q1)', val: '87.3', unit: '/100', pct: 87 }, down: false },
  { label: 'Indeks Kualitas Tutupan Lahan', ctx: 'Deforestasi netto', before: { yr: '2024', val: '62.1', unit: '/100', pct: 62 }, after: { yr: '2026 (Q1)', val: '68.9', unit: '/100', pct: 68 }, down: false },
  { label: 'Emisi Gas Rumah Kaca', ctx: 'Kontribusi nasional · target NDC', before: { yr: '2024', val: '1,142', unit: ' Mt', pct: 100 }, after: { yr: '2026 (Q1)', val: '1,034', unit: ' Mt', pct: 90 }, down: true },
  { label: 'Volume Sampah Open Dumping', ctx: '350+ TPA nasional', before: { yr: '2024', val: '42', unit: '%', pct: 42 }, after: { yr: '2026 (Q1)', val: '28', unit: '%', pct: 28 }, down: true },
]

export default function QualityPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          KPI Mutu Lingkungan <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Pra & Pasca 2026</em>
        </h3>
        <span style={{ fontSize: 12, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace' }}>Perbandingan capaian sebelum dan setelah implementasi kebijakan</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMPARE_DATA.map(d => (
          <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18, alignItems: 'center', padding: '14px 16px', background: 'white', border: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>{d.label}</div>
              <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 2 }}>{d.ctx}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--bark-soft)', textTransform: 'uppercase', marginBottom: 4 }}>{d.before.yr}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>
                  {d.before.val}<em style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--bark-soft)', fontWeight: 400 }}>{d.before.unit}</em>
                </div>
                <div style={{ height: 6, background: 'var(--line-soft)', marginTop: 6, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${d.before.pct}%`, height: '100%', background: d.down ? 'var(--clay)' : 'var(--clay)', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: d.down ? 'var(--clay)' : 'var(--leaf-mid)' }}>→</div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--bark-soft)', textTransform: 'uppercase', marginBottom: 4 }}>{d.after.yr}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>
                  {d.after.val}<em style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--bark-soft)', fontWeight: 400 }}>{d.after.unit}</em>
                </div>
                <div style={{ height: 6, background: 'var(--line-soft)', marginTop: 6, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${d.after.pct}%`, height: '100%', background: 'var(--leaf-mid)', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
