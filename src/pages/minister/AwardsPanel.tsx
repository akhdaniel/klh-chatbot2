const TROPHIES = [
  { icon: '🏆', cls: 'gold', meta: 'Global · 2025', name: 'UN Champions of the Earth', desc: 'Diberikan UNEP atas kontribusi Indonesia dalam restorasi 1.2 juta hektar lahan gambut.', tags: ['UNEP', 'Gambut', 'SDG 15'] },
  { icon: '🌱', cls: 'green', meta: 'Regional · 2025', name: 'ASEAN Green Leadership Award', desc: 'Penghargaan ASEAN Secretariat atas inisiatif "Akhiri Open Dumping" sebagai best practice regional.', tags: ['ASEAN', 'Sampah', 'SDG 11'] },
  { icon: '🥇', cls: 'gold', meta: 'Internasional · 2025', name: 'COP30 Best Country Pavilion', desc: 'Paviliun Indonesia di COP30 Belém dinobatkan sebagai paviliun negara terbaik kategori climate action.', tags: ['UNFCCC', 'COP30', 'SDG 13'] },
  { icon: '🥈', cls: 'silver', meta: 'Global · 2024', name: 'Earthshot Prize Finalist', desc: 'Program Mangrove for the Future Indonesia masuk 5 besar finalis kategori "Revive Our Oceans".', tags: ['Earthshot', 'Mangrove', 'SDG 14'] },
  { icon: '🌳', cls: 'green', meta: 'Internasional · 2025', name: 'FOLU Net Sink Recognition', desc: 'Pencapaian sektor kehutanan & lahan menjadi net sink karbon di tahun 2030 diakui IPCC dan WRI.', tags: ['FOLU 2030', 'Karbon', 'SDG 13'] },
  { icon: '🥉', cls: 'bronze', meta: 'Global · 2025', name: 'Global Climate Action Award', desc: 'UNFCCC Momentum for Change — Carbon Market Indonesia sebagai inisiatif terobosan tata kelola.', tags: ['UNFCCC', 'Carbon Market', 'SDG 13'] },
]

const ICON_COLORS: Record<string, string> = {
  gold: 'linear-gradient(135deg, #fde68a, #d97706)',
  silver: 'linear-gradient(135deg, #e5e7eb, #9ca3af)',
  bronze: 'linear-gradient(135deg, #fde2c8, #b45309)',
  green: 'linear-gradient(135deg, #d4e9dd, #2d8068)',
}

const PODIUM = [
  { scope: '⬢ ASEAN · Regional', rank: '#3', of: '/10', desc: 'Negara dengan komitmen perubahan iklim tertinggi', event: 'ASEAN Environment Index 2025', cls: 'regional', top: 'var(--sun)' },
  { scope: '🌏 Asia-Pasifik · Benua', rank: '#8', of: '/45', desc: 'Pengelolaan kawasan konservasi & biodiversitas', event: 'UNEP Asia-Pacific Report 2025', cls: 'continent', top: 'var(--leaf-mid)' },
  { scope: '🌐 Dunia · Global', rank: '#27', of: '/180', desc: 'Environmental Performance Index', event: 'EPI · Yale University 2025', cls: 'global', top: '#d97706' },
]

export default function AwardsPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          Ranking <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Regional · Benua · Global</em>
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 32 }}>
        {PODIUM.map(p => (
          <div key={p.scope} style={{ background: 'white', border: '1px solid var(--line)', padding: '14px 16px', textAlign: 'center', borderTop: `4px solid ${p.top}` }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bark-soft)', marginBottom: 8 }}>{p.scope}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 500, lineHeight: 1, color: 'var(--leaf-deep)', letterSpacing: '-0.03em' }}>
              {p.rank}<em style={{ fontStyle: 'italic', fontSize: 16, color: 'var(--clay)', fontWeight: 400, verticalAlign: 'top' }}>{p.of}</em>
            </div>
            <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 4 }}>{p.desc}</div>
            <div style={{ fontSize: 11, marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--line)', color: 'var(--ink)', fontWeight: 500 }}>{p.event}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
          Trophy & Penghargaan <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· 2024–2026</em>
        </h3>
        <span style={{ fontSize: 12, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace' }}>12 penghargaan diraih Indonesia</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {TROPHIES.map(t => (
          <div key={t.name} style={{ border: '1.5px solid var(--ink)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 12px', background: 'linear-gradient(135deg, var(--leaf-paper) 0%, white 100%)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: ICON_COLORS[t.cls], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 12px rgba(232,179,65,0.3)' }}>{t.icon}</div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', marginBottom: 2 }}>{t.meta}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.25 }}>{t.name}</div>
              </div>
            </div>
            <div style={{ padding: '12px 18px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--bark-soft)', lineHeight: 1.5, marginBottom: 10 }}>{t.desc}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 9.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', padding: '2px 7px', background: 'var(--leaf-paper)', color: 'var(--leaf-deep)', borderRadius: 2, fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
