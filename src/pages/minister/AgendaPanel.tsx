const AGENDA = [
  { day: '26', dayName: 'SEL', time: '09:00', cat: 'Kenegaraan', catClass: 'state', title: 'Sidang Kabinet Paripurna — Presiden Prabowo Subianto', loc: 'Istana Negara', peserta: '30 Menteri', tujuan: 'Pembahasan RPJMN Lingkungan 2025–2029', priority: 'critical', skor: 95 },
  { day: '27', dayName: 'RAB', time: '14:00', cat: 'Internasional', catClass: 'intl', title: 'COP31 Preparatory Bilateral — Menteri Lingkungan Brasil', loc: 'Hotel Indonesia Kempinski', peserta: 'Bilateral', tujuan: 'Carbon market & deforestasi', priority: 'critical', skor: 92 },
  { day: '28', dayName: 'KAM', time: '10:30', cat: 'Publik', catClass: 'public', title: 'Peresmian PLTSa Cilegon — Pembangkit Listrik Tenaga Sampah', loc: 'Cilegon, Banten', peserta: 'Liputan media nasional', tujuan: 'Implementasi "Akhiri Open Dumping"', priority: 'high', skor: 88 },
  { day: '29', dayName: 'JUM', time: '08:00', cat: 'Koordinasi', catClass: 'coord', title: 'Rakornas Penanganan Karhutla — 10 Provinsi Rawan', loc: 'Auditorium KLH', peserta: 'Gubernur, Bupati, Kapolda', tujuan: 'Persiapan musim kering 2026', priority: 'high', skor: 82 },
  { day: '30', dayName: 'SAB', time: '19:00', cat: 'Protokoler', catClass: 'proto', title: 'Penganugerahan Kalpataru & Adipura 2026', loc: 'Istana Wakil Presiden', peserta: '35 penerima', tujuan: 'Live TVRI', priority: 'medium', skor: 72 },
  { day: '27', dayName: 'RAB', time: '09:00', cat: 'Internal', catClass: 'internal', title: 'Webinar UMKM Hijau — Sertifikasi Ekolabel', loc: 'Daring', peserta: '~300 peserta UMKM', tujuan: 'Delegasi ke Dirjen PSLB3', priority: 'delegate', skor: 35 },
  { day: '28', dayName: 'KAM', time: '15:00', cat: 'Internal', catClass: 'internal', title: 'Rapat Teknis Revisi Baku Mutu Air Limbah', loc: 'Kantor KLH', peserta: 'Tim teknis', tujuan: 'Delegasi ke Dirjen PPKL', priority: 'delegate', skor: 28 },
]

const PRIORITY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  critical: { bg: 'var(--clay)', color: 'white', label: 'Kritis' },
  high: { bg: 'var(--sun)', color: 'var(--leaf-deep)', label: 'Tinggi' },
  medium: { bg: 'var(--leaf-light)', color: 'var(--leaf-deep)', label: 'Sedang' },
  delegate: { bg: 'white', color: 'var(--bark-soft)', label: 'Delegasi' },
}

const BORDER_COLOR: Record<string, string> = {
  critical: 'var(--clay)', high: 'var(--sun)', medium: 'var(--leaf-mid)', delegate: 'var(--line)',
}

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  state: { bg: '#fef3c7', color: 'var(--status-open)' },
  intl: { bg: '#dbeafe', color: 'var(--status-progress)' },
  coord: { bg: '#ede9fe', color: '#7c3aed' },
  public: { bg: '#d1fae5', color: 'var(--status-resolved)' },
  proto: { bg: '#fce7f3', color: '#be185d' },
  internal: { bg: '#f3f4f6', color: 'var(--bark-soft)' },
}

const INVITATIONS = [
  { from: 'Kemenko Marves', event: 'Rakor Carbon Tax · 3 Juni' },
  { from: 'UN Environment', event: 'High-Level Dialogue · 8 Juni · Nairobi' },
  { from: 'PT Pertamina', event: 'Peresmian Green Refinery · 12 Juni' },
]

const CAT_RANKS = [
  { rank: '01', name: 'Kenegaraan', pct: 100, color: '#fbbf24', count: 14 },
  { rank: '02', name: 'Internasional', pct: 78, color: '#3b82f6', count: 11 },
  { rank: '03', name: 'Koordinasi Antar-K/L', pct: 64, color: '#7c3aed', count: 9 },
  { rank: '04', name: 'Publik & Peresmian', pct: 50, color: '#10b981', count: 7 },
  { rank: '05', name: 'Protokoler', pct: 36, color: '#ec4899', count: 5 },
  { rank: '06', name: 'Internal Kementerian', pct: 8, color: '#6b7280', count: 1 },
]

export default function AgendaPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
            Agenda Pekan Ini <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· 25–31 Mei 2026</em>
          </h3>
          <span style={{ fontSize: 12, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>47 undangan masuk · 12 dijadwalkan</span>
        </div>

        {/* AI Card */}
        <div style={{ background: 'linear-gradient(135deg, var(--leaf-paper), white)', border: '1.5px solid var(--ink)', padding: '18px 20px', position: 'relative', marginBottom: 18 }}>
          <div style={{ position: 'absolute', top: -12, left: 16, background: 'var(--ink)', color: 'var(--sun)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '3px 10px', letterSpacing: '0.15em' }}>AI</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, color: 'var(--leaf-deep)', marginBottom: 8 }}>Analisis & Saran Prioritas — minggu ini</div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--bark)' }}>
            Dari <strong style={{ color: 'var(--leaf-deep)' }}>47 undangan</strong>, AI menganalisis kepadatan jadwal, urgensi politik, dampak strategis, dan tujuan ESG. Rekomendasi: prioritaskan <strong style={{ color: 'var(--leaf-deep)' }}>3 agenda kritis</strong> dan delegasikan sisanya.
          </div>
          {[
            { mark: '✓', cls: 'hadiri', bg: 'var(--leaf-mid)', text: '<strong>Hadiri:</strong> Sidang Kabinet, COP31 Preparatory Meeting, Peresmian PLTSa Cilegon — dampak nasional & internasional tinggi' },
            { mark: '→', cls: 'delegasi', bg: 'var(--clay)', text: '<strong>Delegasikan:</strong> Webinar UMKM Hijau → Dirjen PSLB3 · Rapat teknis baku mutu → Dirjen PPKL · Sosialisasi sekolah → Eselon II' },
          ].map(r => (
            <div key={r.cls} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: '1px dashed var(--line-soft)', marginTop: 10, fontSize: 12 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>{r.mark}</div>
              <span style={{ flex: 1, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: r.text }} />
            </div>
          ))}
        </div>

        {/* Agenda cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AGENDA.map((a, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, padding: '16px 18px', background: a.priority === 'delegate' ? 'rgba(248,248,245,0.6)' : 'white', border: '1px solid var(--line)', borderLeft: `4px solid ${BORDER_COLOR[a.priority]}`, borderRadius: '0 4px 4px 0', opacity: a.priority === 'delegate' ? 0.85 : 1, transition: 'all 0.2s ease' }}>
              <div style={{ textAlign: 'center', paddingRight: 16, borderRight: '1px dashed var(--line-soft)' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, lineHeight: 1, color: 'var(--leaf-deep)' }}>{a.day}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark-soft)', marginTop: 4 }}>{a.dayName}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink)', fontWeight: 600, marginTop: 6 }}>{a.time}</div>
              </div>
              <div>
                <span style={{ display: 'inline-block', fontSize: 9.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 3, fontWeight: 700, marginBottom: 6, ...CAT_STYLE[a.catClass] }}>{a.cat}</span>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.3 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--bark-soft)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {a.loc && <span>📍 <strong style={{ color: 'var(--ink)' }}>{a.loc}</strong></span>}
                  {a.peserta && <span>👥 {a.peserta}</span>}
                  {a.tujuan && <span>🎯 {a.tujuan}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 110 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 3, textTransform: 'uppercase', background: PRIORITY_BADGE[a.priority].bg, color: PRIORITY_BADGE[a.priority].color, border: a.priority === 'delegate' ? '1px dashed var(--line)' : 'none' }}>{PRIORITY_BADGE[a.priority].label}</span>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)', lineHeight: 1 }}>
                  {a.skor}<em style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--bark-soft)', fontWeight: 400 }}>/100</em>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {a.priority !== 'delegate' ? (
                    <>
                      <button style={{ background: 'var(--ink)', color: 'white', border: '1px solid var(--ink)', padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', borderRadius: 3 }}>Hadir</button>
                      <button style={{ background: 'white', border: '1px solid var(--line)', padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', borderRadius: 3, color: 'var(--bark)' }}>Brief</button>
                    </>
                  ) : (
                    <button style={{ background: 'white', border: '1px solid var(--line)', padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', borderRadius: 3, color: 'var(--bark)' }}>Delegasikan</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div>
        <button style={{ background: 'var(--sun)', border: '1.5px solid var(--ink)', padding: '12px 16px', width: '100%', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--leaf-deep)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          ✉ Ajukan Undangan Menteri
        </button>

        <div style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>Kategori Agenda · Bulan Ini</span>
            <span style={{ color: 'var(--clay)' }}>Mei 2026</span>
          </div>
          {CAT_RANKS.map(r => (
            <div key={r.rank} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, padding: '6px 0', alignItems: 'center', borderBottom: '1px dashed var(--line-soft)' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 11, color: 'var(--clay)' }}>{r.rank}</div>
              <div>
                <div style={{ fontSize: 12.5 }}>{r.name}</div>
                <div style={{ height: 6, background: 'var(--line-soft)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{r.count}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)', marginBottom: 12 }}>Undangan Masuk · Hari Ini</div>
          {INVITATIONS.map((inv, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < INVITATIONS.length - 1 ? '1px dashed var(--line-soft)' : 'none', fontSize: 11.5, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>{inv.from}</strong><br />
              <span style={{ color: 'var(--bark-soft)' }}>{inv.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
