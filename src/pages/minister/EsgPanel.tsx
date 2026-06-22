const SDG_TILES = [
  { num: 1, lbl: 'Tanpa Kemiskinan', active: false },
  { num: 2, lbl: 'Tanpa Kelaparan', active: false },
  { num: 3, lbl: 'Kehidupan Sehat', active: false },
  { num: 4, lbl: 'Pendidikan', active: false },
  { num: 5, lbl: 'Kesetaraan Gender', active: false },
  { num: 6, lbl: 'Air Bersih', active: true },
  { num: 7, lbl: 'Energi Bersih', active: true },
  { num: 8, lbl: 'Pekerjaan Layak', active: false },
  { num: 9, lbl: 'Industri', active: false },
  { num: 10, lbl: 'Ketimpangan', active: false },
  { num: 11, lbl: 'Kota Layak', active: true },
  { num: 12, lbl: 'Konsumsi Bertg', active: true },
  { num: 13, lbl: 'Iklim', active: true },
  { num: 14, lbl: 'Ekosistem Laut', active: true },
  { num: 15, lbl: 'Ekosistem Darat', active: true },
  { num: 16, lbl: 'Perdamaian', active: false },
]

const ESG_DATA = [
  { cat: 'E · Environmental', items: [
    ['Komitmen Net Zero', '2060'],
    ['Carbon Market Volume', '8.4 juta tCO₂'],
    ['Kawasan Konservasi', '27.4 juta ha'],
    ['Mangrove Terlindungi', '3.36 juta ha'],
    ['FOLU Net Sink', 'Target 2030'],
  ]},
  { cat: 'S · Social', items: [
    ['Pengaduan Publik Ditangani', '247/hari'],
    ['Chatbot Aksesibilitas 24/7', 'WhatsApp'],
    ['Kalpataru Penerima', '35/tahun'],
    ['AMDAL Transparansi', 'Publik'],
    ['Anonim Pelaporan', 'Dilindungi UU PDP'],
  ]},
  { cat: 'G · Governance', items: [
    ['Sertifikasi Karbon', 'ISO 14064'],
    ['Audit Lingkungan PROPER', 'Tahunan'],
    ['Open Data Emisi', 'Real-time'],
    ['KPI Menteri Dashboard', 'Aktif'],
    ['Ratifikasi Paris Agr.', '2016'],
  ]},
]

export default function EsgPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          Profil ESG & SDG <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Kementerian Lingkungan Hidup</em>
        </h3>
      </div>

      {/* ESG Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {ESG_DATA.map(e => (
          <div key={e.cat} style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 18px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--leaf-mid)', marginBottom: 12 }}>{e.cat}</div>
            {e.items.map(([lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed var(--line-soft)', fontSize: 12 }}>
                <span style={{ color: 'var(--bark)' }}>{lbl}</span>
                <strong style={{ color: 'var(--leaf-deep)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{val}</strong>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* SDG Grid */}
      <div style={{ background: 'linear-gradient(135deg, var(--leaf-deep) 0%, #082821 100%)', color: 'white', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 8, right: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.25em', color: 'var(--sun)' }}>ESG · SDG</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
          SDG Alignment <em style={{ fontStyle: 'italic', color: 'var(--sun-soft)' }}>· Target Relevan KLH</em>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(212,233,221,0.85)', marginBottom: 14 }}>7 dari 17 SDG menjadi fokus utama kebijakan Kementerian LH</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 6 }}>
          {SDG_TILES.map(s => (
            <div key={s.num} style={{
              background: s.active ? 'var(--sun)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${s.active ? 'var(--sun)' : 'rgba(255,255,255,0.12)'}`,
              color: s.active ? 'var(--leaf-deep)' : 'white', padding: '8px 6px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 8.5, marginTop: 3, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', opacity: 0.9 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
