import { useState, useEffect } from 'react'
import type { UITicket } from '../../types'

interface Message {
  role: 'bot' | 'customer' | 'staff'
  av: string
  who: string
  when: string
  text: string
}

const DEFAULT_TRANSCRIPT: Message[] = [
  { role: 'bot', av: 'AI', who: 'KLH Asisten', when: '09:28', text: 'Selamat pagi 🌱 Saya asisten resmi Kementerian Lingkungan Hidup. Sebelum melanjutkan, boleh saya tahu nama dan kota Anda? <em>(opsional)</em>' },
  { role: 'customer', av: 'BS', who: 'Pengguna', when: '09:29', text: 'Budi, dari Karawang.' },
  { role: 'bot', av: 'AI', who: 'KLH Asisten', when: '09:29', text: 'Terima kasih. Apa yang bisa saya bantu hari ini?' },
  { role: 'customer', av: 'BS', who: 'Pengguna', when: '09:31', text: 'Saya mau lapor. Air Sungai Citarum di belakang rumah saya berubah jadi hitam pekat dan baunya menyengat sejak kemarin sore.' },
  { role: 'bot', av: 'AI', who: 'KLH Asisten', when: '09:31', text: 'Terima kasih atas laporannya. Ini dicatat sebagai <strong>pengaduan pencemaran air</strong>. Tiket dibuat: <strong>KLH-PCM-2026-0428</strong>' },
]

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

export default function TicketDetail({ ticket }: { ticket: UITicket | null }) {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_TRANSCRIPT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ticket || !ticket.id) {
      setMessages(DEFAULT_TRANSCRIPT)
      return
    }

    const loadTicketConversation = async () => {
      try {
        setLoading(true)
        const displayMessages: Message[] = [
          {
            role: 'bot',
            av: 'AI',
            who: 'KLH Asisten',
            when: formatTime(ticket.created_at),
            text: `Tiket <strong>${ticket.nomor}</strong> dibuat. Kategori: <strong>${ticket.kategori}</strong>`,
          },
          {
            role: 'customer',
            av: 'US',
            who: ticket.pelapor || 'Pengguna',
            when: formatTime(ticket.created_at),
            text: `<strong>${ticket.judul}</strong><br/>${ticket.preview || ''}`,
          },
        ]

        // If we have location info, add it
        if (ticket.lokasi) {
          displayMessages.push({
            role: 'customer',
            av: 'US',
            who: ticket.pelapor || 'Pengguna',
            when: formatTime(ticket.created_at),
            text: `📍 Lokasi: <strong>${ticket.lokasi}</strong>`,
          })
        }

        // Add status update
        displayMessages.push({
          role: 'bot',
          av: 'AI',
          who: 'KLH Asisten',
          when: formatTime(ticket.updated_at),
          text: `Status berubah menjadi: <strong>${ticket.status}</strong>`,
        })

        setMessages(displayMessages)
      } catch (err) {
        console.error('Error loading ticket:', err)
        setMessages(DEFAULT_TRANSCRIPT)
      } finally {
        setLoading(false)
      }
    }

    loadTicketConversation()
  }, [ticket?.id])

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
        {loading && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--bark-soft)', padding: '20px' }}>
            Loading percakapan...
          </div>
        )}
        {!loading && messages.length > 0 && (
          <>
            <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative', margin: '0 0 4px' }}>
              — Percakapan dimulai · {messages[0]?.when || '—'} —
            </div>
            {messages.map((m, i) => {
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
      </div>
    </div>
  )
}
