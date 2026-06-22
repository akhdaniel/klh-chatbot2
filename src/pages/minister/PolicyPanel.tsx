const POLICIES = [
  {
    priority: 'PRIORITAS 01', iso: '▲ CARBON · NDC 2030', title: 'Pasar Karbon Indonesia (IDX Carbon)',
    desc: 'Bursa karbon resmi pertama di ASEAN. Target reduksi 31.89% (unconditional) hingga 43.20% (conditional) GRK pada 2030.',
    stats: [['8.4 juta tCO₂', 'Volume diperdagangkan'], ['Rp 2.1 T', 'Nilai transaksi · 2025']],
    progress: 62, progressLabel: 'Progres target NDC',
    badges: ['ISO 14064', 'UNFCCC', 'VCS', 'Paris Agreement'],
  },
  {
    priority: 'PRIORITAS 02', iso: '▲ EMISI · WHO AQG', title: 'Pengendalian Emisi PLTU & Industri',
    desc: 'Sistem CEMS (Continuous Emission Monitoring System) wajib pada 247 fasilitas industri. Batas emisi mengacu WHO Air Quality Guidelines 2021.',
    stats: [['247 fasilitas', 'Terpasang CEMS'], ['−18% NOx', 'Penurunan vs 2024']],
    progress: 74, progressLabel: 'Coverage industri prioritas',
    badges: ['WHO AQG', 'ISO 14001', 'PROPER'],
  },
  {
    priority: 'PRIORITAS 03', iso: '▲ AIR LIMBAH · UN SDG 6', title: 'Sistem Pemantauan Air Limbah Real-time (SPARING)',
    desc: 'Sensor IoT terkoneksi langsung ke KLH pada outlet pabrik. Data real-time pH, BOD, COD, TSS, TDS terpublikasi ke publik.',
    stats: [['1,847 pabrik', 'Terhubung SPARING'], ['99.2%', 'Uptime sensor']],
    progress: 81, progressLabel: 'Industri wajib terkoneksi',
    badges: ['UN SDG 6', 'EU Water', 'ISO 17025'],
  },
  {
    priority: 'PRIORITAS 04', iso: '▲ AIR LINDI · LANDFILL · BASEL', title: 'Pengelolaan Air Lindi TPA & Sanitary Landfill',
    desc: 'Transformasi 350+ TPA open dumping menjadi sanitary landfill dengan IPAL lindi. Target zero open dumping 2030.',
    stats: [['218/350 TPA', 'Sudah sanitary'], ['2030', 'Target zero OD']],
    progress: 62, progressLabel: 'TPA terkonversi',
    badges: ['Basel Conv.', 'UN SDG 11', 'ISO 14001'],
  },
]

export default function PolicyPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          Kebijakan Unggulan <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· International Compliant</em>
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {POLICIES.map(p => (
          <div key={p.priority} style={{ background: 'white', border: '1.5px solid var(--ink)', padding: '18px 20px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--ink)', color: 'var(--sun)', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', padding: '4px 10px', fontWeight: 700, textTransform: 'uppercase' }}>{p.priority}</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, color: 'var(--clay)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>{p.iso}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: 'var(--leaf-deep)', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{p.title}</div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--bark)', lineHeight: 1.5 }}>{p.desc}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '10px 0', borderTop: '1px dashed var(--line)', borderBottom: '1px dashed var(--line)', margin: '10px 0' }}>
              {p.stats.map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: 'var(--ink)', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--bark-soft)', marginTop: 4 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span>{p.progressLabel}</span><strong style={{ color: 'var(--leaf-mid)' }}>{p.progress}%</strong>
            </div>
            <div style={{ height: 8, background: 'var(--line-soft)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ width: `${p.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--leaf-mid), var(--leaf-deep))', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {p.badges.map(b => (
                <span key={b} style={{ background: 'var(--leaf-paper)', border: '1px solid var(--leaf-light)', padding: '3px 8px', fontSize: 9.5, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--leaf-deep)', letterSpacing: '0.05em', borderRadius: 2 }}>{b}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
