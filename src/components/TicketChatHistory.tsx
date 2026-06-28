/**
 * TicketChatHistory - Lazy load chat history for a ticket
 */
import { useState, useEffect } from 'react'
import { chatApi } from '../api/pgrest'
import type { Message } from '../types'

interface TicketChatHistoryProps {
  senderNo: string
  ticketNumber: string
  isOpen: boolean
  onClose: () => void
}

export default function TicketChatHistory({ senderNo, ticketNumber, isOpen, onClose }: TicketChatHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lazy load chat history when modal opens
  useEffect(() => {
    if (!isOpen || !senderNo) return

    const loadChatHistory = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await chatApi.getHistory(senderNo, 100)
        if (response.ok && response.data) {
          setMessages(response.data)
        } else {
          setError('Gagal memuat riwayat chat')
        }
      } catch (err) {
        setError('Error loading chat history')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadChatHistory()
  }, [isOpen, senderNo])

  if (!isOpen) return null

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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              💬 Riwayat Chat
            </h3>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Tiket: {ticketNumber}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          background: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                border: '3px solid #eee',
                borderTop: '3px solid #166534',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ marginTop: '12px' }}>Memuat riwayat chat...</div>
            </div>
          )}

          {error && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#dc2626',
              background: '#fee2e2',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
              <div>Tidak ada riwayat chat</div>
            </div>
          )}

          {!loading && !error && messages.map((msg) => {
            const style = getBubbleStyle(msg.sender_type)
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: style.align as any,
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  background: style.background,
                  border: `1px solid ${style.border}`,
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    color: msg.sender_type === 'bot' ? '#166534' : msg.sender_type === 'staff' ? '#dc2626' : '#333'
                  }}>
                    {msg.sender_type === 'bot' ? 'KLH Asisten' : msg.sender_type === 'staff' ? 'Staff' : 'Pengguna'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  <div style={{
                    fontSize: '10px',
                    color: '#666',
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #eee',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          {messages.length} pesan • Lazy loaded
        </div>
      </div>
    </div>
  )
}
