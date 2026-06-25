import { useState, useEffect } from 'react'
import type { UITicket, Message } from '../../types'
import { ticketsApi } from '../../api/pgrest'

interface TicketDetailProps {
  ticket: UITicket | null
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load chat history when ticket is selected
  useEffect(() => {
    if (!ticket?.id) {
      setMessages([])
      return
    }

    const loadChatHistory = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await ticketsApi.getChatHistory(ticket.id, 100)
        if (response.ok && response.data) {
          setMessages(response.data)
        } else {
          setError(response.error || 'Gagal memuat riwayat chat')
        }
      } catch (err) {
        setError('Error loading chat history')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadChatHistory()
  }, [ticket?.id])

  if (!ticket) return null

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      })
    } catch {
      return '--:--'
    }
  }

  const getBubbleStyle = (senderType: string) => {
    switch (senderType) {
      case 'bot':
        return { background: '#e8f5f2', border: '#98d4c8', align: 'flex-start' }
      case 'staff':
        return { background: '#ffe8e0', border: '#f5a892', align: 'flex-end' }
      default:
        return { background: '#fffbf0', border: '#f5d98a', align: 'flex-start' }
    }
  }

  const getSenderLabel = (senderType: string) => {
    switch (senderType) {
      case 'bot': return 'KLH Asisten'
      case 'staff': return 'Staff'
      default: return 'Pengguna'
    }
  }

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

      {/* Chat History Section */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 24px', background: '#f0f9f6', borderBottom: '1px solid var(--line-soft)' }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--leaf-deep)' }}>
            💬 Riwayat Percakapan
          </h4>
        </div>

        <div style={{ flex: 1, padding: '16px 24px', background: '#f8f9fa', overflowY: 'auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark-soft)' }}>
              <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #eee', borderTop: '3px solid var(--leaf-deep)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: 12 }}>Memuat riwayat chat...</div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--clay)', background: '#fee', borderRadius: 6 }}>
              {error}
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark-soft)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div>Belum ada percakapan untuk tiket ini.</div>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, idx) => {
                const style = getBubbleStyle(msg.sender_type)
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: style.align as any }}>
                    <div style={{
                      maxWidth: '80%',
                      background: style.background,
                      border: `1px solid ${style.border}`,
                      borderRadius: 12,
                      padding: '10px 14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--leaf-deep)', marginBottom: 4, textTransform: 'uppercase' }}>
                        {getSenderLabel(msg.sender_type)}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--bark-soft)', marginTop: 4, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
