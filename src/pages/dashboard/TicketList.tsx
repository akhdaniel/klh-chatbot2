import type { UITicket } from '../../types'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

const CAT_LABELS: Record<string, string> = {
  pengaduan: 'Pengaduan · PPKL', karhutla: 'Karhutla · Gakkum',
  carbon_credit: 'Carbon Credit · PPI', persuratan: 'Persuratan · Setjen',
  hoax: 'Hoax · Humas', edukasi: 'Edukasi · Setjen', konservasi: 'Konservasi · KSDAE', lainnya: 'Lainnya',
}

export default function TicketList({ tickets, selected, onSelect }: {
  tickets: UITicket[]; selected: UITicket | null; onSelect: (t: UITicket) => void
}) {
  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {tickets.map(t => (
        <div key={t.id} onClick={() => onSelect(t)} style={{
          padding: '14px 24px', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer',
          background: selected && selected.id === t.id ? 'rgba(212,233,221,0.45)' : 'transparent',
          boxShadow: selected && selected.id === t.id ? 'inset 3px 0 0 var(--leaf-mid)' : 'none',
          transition: 'background 0.15s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, fontWeight: 600, color: 'var(--bark-soft)' }}>{t.nomor}</span>
            <span className={`status-pill ${t.status}`}>{t.status === 'in_progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.35 }}>{t.judul}</div>
          <div style={{ fontSize: 12, color: 'var(--bark-soft)', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.preview}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, fontSize: 11, color: 'var(--bark-soft)' }}>
            <span style={{ fontSize: 10, padding: '2px 7px', background: 'white', border: '1px solid var(--line)', borderRadius: 3, fontWeight: 500, color: 'var(--bark)' }}>{CAT_LABELS[t.kategori]}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: t.anonim ? 'var(--clay)' : 'var(--leaf-mid)', fontWeight: 600 }}>
              {t.sumber === 'whatsapp' ? '📱 WA' : t.anonim ? '🌐 Web · Anonim' : '🌐 Web'}
            </span>
            {t.pelapor && <><span style={{ color: 'var(--line)' }}>·</span><span>{t.pelapor}</span></>}
            <span style={{ color: 'var(--line)' }}>·</span>
            <span>{timeAgo(t.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
