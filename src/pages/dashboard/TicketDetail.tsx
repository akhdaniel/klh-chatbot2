import type { UITicket, Message } from '../../types'

interface MessageDisplay {
  role: 'bot' | 'customer' | 'staff'
  av: string
  who: string
  when: string
  text: string
}

const AV_COLORS: Record<string, { bg: string; color: string }> = {
  bot: { bg: 'var(--leaf-deep)', color: 'white' },
  customer: { bg: 'var(--sun)', color: 'var(--leaf-deep)' },
  staff: { bg: 'var(--clay)', color: 'white' },
}
const WHO_COLORS: Record<string, string> = {
  bot: 'var(--leaf-deep)', customer: 'var(--ink)', staff: 'var(--clay)',
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

interface TicketDetailProps {
  ticket: UITicket | null
  conversationHistory?: Message[]
  historyLoading?: boolean
  historyError?: string | null
}

export default function TicketDetail({ 
  ticket, 
  conversationHistory = [], 
  historyLoading = false,
  historyError = null 
}: TicketDetailProps) {
  
  // Transform API messages to display format
  const transformMessages = (messages: Message[]): MessageDisplay[] => {
    return messages.map(msg => {
      let role: 'bot' | 'customer' | 'staff' = 'customer'
      let who = 'Pengguna'
      let av = 'US'
      
      if (msg.sender_type === 'bot') {
        role = 'bot'
        who = 'KLH Asisten'
        av = 'AI'
      } else if (msg.sender_type === 'staff') {
        role = 'staff'
        who = 'Staff KLH'
        av = 'ST'
      }
      
      return {
        role,
        av,
        who,
        when: formatTime(msg.created_at),
        text: msg.content
      }
    })
  }

  const displayMessages = conversationHistory.length > 0 
    ? transformMessages(conversationHistory)
    : []

  if (!ticket) return null
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--line-soft)', background: 'linear-gradient(180deg, rgba(212,233,221,0.25), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span className={`status-pill ${ticket.status}`}>{ticket.status === 'in_progress' ? 'In Progress' : ticket.status}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--bark-soft)' }}>{ticket.nomor}</span>
          <span style={{ fontSize: 10, padding: '2px 7px', background: 'white', border: '1px solid var(--line)', borderRadius: 3, fontWeight: 500, color: 'var(--bark)' }}>{ticket.kategori} · {ticket.unit}</span>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)', lineHeight: 1.2, marginBottom: 8 }}>{ticket.judul}</div>
        <div style={{ fontSize: 12, color: 'var(--bark-soft)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ticket.pelapor && <span><strong style={{ color: 'var(--ink)' }}>Pelapor:</strong> {ticket.pelapor}</span>}
          {ticket.lokasi && <span><strong style={{ color: 'var(--ink)' }}>Lokasi:</strong> {ticket.lokasi}</span>}
          {ticket.sla_jam && <span><strong style={{ color: 'var(--ink)' }}>SLA:</strong> {ticket.sla_jam} jam tersisa</span>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid var(--line-soft)', background: 'var(--paper)', flexWrap: 'wrap' }}>
        {[
          { label: 'Tugaskan ke Tim', primary: true },
          { label: 'Ubah Kategori' },
          { label: 'Eskalasi' },
          { label: 'Tandai Resolved' },
          { label: 'Close Ticket', danger: true },
        ].map(btn => (
          <button key={btn.label} style={{
            padding: '6px 12px', fontSize: 11.5, fontWeight: 600, borderRadius: 5, cursor: 'pointer',
            background: btn.primary ? 'var(--leaf-deep)' : 'white',
            color: btn.primary ? 'white' : btn.danger ? 'var(--clay)' : 'var(--bark)',
            border: btn.primary ? '1px solid var(--leaf-deep)' : btn.danger ? '1px solid var(--clay)' : '1px solid var(--line)',
          }}>{btn.label}</button>
        ))}
      </div>

      {/* Transcript */}
      <div style={{ flex: 1, padding: '18px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {historyLoading && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--bark-soft)', padding: '20px' }}>
            <div style={{ 
              display: 'inline-block', 
              width: 20, 
              height: 20, 
              border: '2px solid var(--line)', 
              borderTop: '2px solid var(--leaf-deep)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              marginRight: 8 
            }} />
            Loading percakapan...
          </div>
        )}
        
        {historyError && (
          <div style={{ 
            textAlign: 'center', 
            fontSize: 12, 
            color: 'var(--clay)', 
            padding: '20px',
            background: '#fee',
            borderRadius: 6 
          }}>
            Error: {historyError}
          </div>
        )}
        
        {!historyLoading && !historyError && displayMessages.length > 0 && (
          <>
            <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative', margin: '0 0 4px' }}>
              — Percakapan dimulai · {formatDate(conversationHistory[0]?.created_at || ticket.created_at)} —
            </div>
            {displayMessages.map((m, i) => {
              let msgBg = 'white'
              let msgBorder = 'var(--line-soft)'
              if (m.role === 'bot') {
                msgBg = '#e8f5f2'
                msgBorder = '#98d4c8'
              } else if (m.role === 'customer') {
                msgBg = '#fffbf0'
                msgBorder = '#f5d98a'
              } else if (m.role === 'staff') {
                msgBg = '#ffe8e0'
                msgBorder = '#f5a892'
              }
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, ...AV_COLORS[m.role] }}>{m.av}</div>
                  <div style={{ flex: 1, background: msgBg, padding: '10px 14px', borderRadius: 6, border: `1px solid ${msgBorder}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: WHO_COLORS[m.role] }}>{m.who}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--bark-soft)' }}>{m.when}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: m.text }} />
                  </div>
                </div>
              )
            })}
            {ticket.status === 'in_progress' && (
              <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                — Diambil alih oleh staff —
              </div>
            )}
          </>
        )}
        
        {!historyLoading && !historyError && displayMessages.length === 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--bark-soft)', padding: '40px 20px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
            <div>Belum ada percakapan untuk tiket ini.</div>
          </div>
        )}
      </div>
    </div>
  )
}
