import { useState, useEffect, useRef } from 'react'
import { chatApi } from '../../api/pgrest'
import type { Message } from '../../types'

interface Conversation {
  id: number
  phone: string
  name: string
  platform: string
  status: string
  category: string
  priority: string
  last_message: string
  last_message_at: string
  unread_count: number
}

// Hook untuk cek mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

export default function LiveConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()
  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMessageCountRef = useRef<number>(0)
  
  // WebSocket connection for real-time updates with polling fallback
  useEffect(() => {
    
    // Try WebSocket first
    const tryWebSocket = () => {
      const wsUrl = 'wss://bff.xerpium.com'
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('[ws] Connected to KLH Chatbot WebSocket')
        // Stop polling if WebSocket connects
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[ws] Received:', data.type)
          handleRealtimeUpdate(data)
        } catch (err) {
          console.error('[ws] Failed to parse message:', err)
        }
      }
      
      ws.onerror = (error) => {
        console.error('[ws] WebSocket error:', error)
      }
      
      ws.onclose = () => {
        console.log('[ws] Disconnected, falling back to polling')
        startPolling()
      }
      
      wsRef.current = ws
    }
    
    // Fallback: Polling every 3 seconds
    const startPolling = () => {
      if (pollingRef.current) return // Already polling
      
      console.log('[poll] Starting polling fallback')
      pollingRef.current = setInterval(async () => {
        // Poll for new messages if conversation selected
        if (selectedConversation) {
          try {
            const response = await chatApi.getHistory(selectedConversation.id, 100)
            if (response.ok && response.data) {
              const currentCount = response.data.length
              if (currentCount > lastMessageCountRef.current) {
                console.log('[poll] New messages detected:', currentCount - lastMessageCountRef.current)
                setMessages(response.data.reverse())
                lastMessageCountRef.current = currentCount
              }
            }
          } catch (err) {
            // Silently ignore polling errors
          }
        }
        
        // Always poll conversations list
        try {
          const response = await chatApi.getConversations(50)
          if (response.ok && response.data) {
            setConversations(prev => {
              // Only update if different
              const newData = response.data
              if (JSON.stringify(prev) !== JSON.stringify(newData)) {
                return newData
              }
              return prev
            })
          }
        } catch (err) {
          // Silently ignore polling errors
        }
      }, 3000)
    }
    
    // Handle realtime updates (from WS or polling)
    const handleRealtimeUpdate = (data: any) => {
      if (data.type === 'new_message') {
        if (selectedConversation?.id === data.data.conversation_id) {
          setMessages(prev => [...prev, {
            id: data.data.message_id,
            sender_type: data.data.sender_type,
            content: data.data.message,
            created_at: data.data.timestamp,
            conversation_id: data.data.conversation_id
          } as Message])
        }
        loadConversations()
      } else if (data.type === 'conversation_updated') {
        setConversations(prev => prev.map(conv => 
          conv.id === data.data.conversation_id
            ? { ...conv, last_message: data.data.last_message, last_message_at: data.data.last_message_at }
            : conv
        ))
      }
    }
    
    // Start WebSocket, will fallback to polling if fails
    tryWebSocket()
    // Also start polling immediately as backup (will stop if WS connects)
    startPolling()
    
    return () => {
      wsRef.current?.close()
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [selectedConversation?.id])
  
  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])
  
  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation?.id])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await chatApi.getConversations(50)
      if (response.ok && response.data) {
        setConversations(response.data)
      }
    } catch (err) {
      console.error('Gagal memuat percakapan', err)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const loadMessages = async (conversationId: number) => {
    try {
      setMessagesLoading(true)
      const response = await chatApi.getHistory(conversationId, 100)
      if (response.ok && response.data) {
        lastMessageCountRef.current = response.data.length
        setMessages(response.data)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setMessagesLoading(false)
    }
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return
    
    try {
      setSending(true)
      await chatApi.save({
        conversation_id: String(selectedConversation.id),
        sender_type: 'staff',
        content: newMessage.trim()
      })
      setNewMessage('')
      // Reload messages
      await loadMessages(selectedConversation.id)
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Gagal mengirim pesan')
    } finally {
      setSending(false)
    }
  }
  
  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return '--:--'
    }
  }
  
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      })
    } catch {
      return ''
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--leaf-mid)'
      case 'resolved': return 'var(--bark-soft)'
      case 'closed': return '#6b7280'
      default: return 'var(--sun)'
    }
  }
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Kritis'
      case 'high': return 'Tinggi'
      case 'medium': return 'Sedang'
      case 'low': return 'Rendah'
      default: return priority
    }
  }
  
  if (loading) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--bark-soft)'
      }}>
        Memuat percakapan...
      </div>
    )
  }
  
  // Mobile: Show either list or chat
  if (isMobile && selectedConversation) {
    return (
      <ChatView
        conversation={selectedConversation}
        messages={messages}
        messagesLoading={messagesLoading}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sending={sending}
        onSend={handleSendMessage}
        onBack={() => setSelectedConversation(null)}
        formatTime={formatTime}
        formatDate={formatDate}
        messagesEndRef={messagesEndRef}
      />
    )
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      height: '100%',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Conversation List */}
      <div style={{ 
        width: isMobile ? '100%' : 360,
        borderRight: isMobile ? 'none' : '1px solid var(--line)',
        background: 'var(--paper)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--line)',
          background: 'white'
        }}>
          <h3 style={{ 
            fontFamily: 'Fraunces, serif', 
            fontSize: 20, 
            fontWeight: 500, 
            color: 'var(--leaf-deep)',
            margin: 0 
          }}>
            Percakapan Live
          </h3>
          <div style={{ fontSize: 12, color: 'var(--bark-soft)', marginTop: 4 }}>
            {conversations.length} percakapan aktif
          </div>
        </div>
        
        {/* Filter tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          padding: '12px 16px',
          borderBottom: '1px solid var(--line-soft)',
          background: 'white'
        }}>
          {['Semua', 'Aktif', 'Resolved'].map(tab => (
            <button
              key={tab}
              style={{
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid var(--line)',
                borderRadius: 4,
                background: 'white',
                color: 'var(--bark-soft)',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* List */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '8px 0'
        }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--line-soft)',
                cursor: 'pointer',
                background: selectedConversation?.id === conv.id 
                  ? 'rgba(212,233,221,0.4)' 
                  : 'transparent',
                borderLeft: selectedConversation?.id === conv.id 
                  ? '3px solid var(--leaf-deep)' 
                  : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: conv.platform === 'whatsapp' 
                      ? 'linear-gradient(135deg, #25d366, #128c7e)'
                      : 'linear-gradient(135deg, var(--leaf-mid), var(--leaf-deep))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {conv.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: 14, 
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      {conv.name || 'Anonim'}
                      {conv.unread_count > 0 && (
                        <span style={{
                          background: 'var(--clay)',
                          color: 'white',
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 10,
                          fontWeight: 700
                        }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 2 }}>
                      {conv.phone}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatTime(conv.last_message_at)}
                </div>
              </div>
              
              <div style={{ 
                fontSize: 13, 
                color: 'var(--bark-soft)', 
                marginLeft: 44,
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {conv.last_message || 'Tidak ada pesan'}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 6, 
                marginLeft: 44,
                marginTop: 8 
              }}>
                <span style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: getStatusColor(conv.status),
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {conv.status}
                </span>
                <span style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  color: 'var(--bark-soft)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {getPriorityLabel(conv.priority)}
                </span>
                <span style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  color: 'var(--bark-soft)'
                }}>
                  {conv.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area - Desktop only (mobile shows full screen) */}
      {!isMobile && selectedConversation && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatView
            conversation={selectedConversation}
            messages={messages}
            messagesLoading={messagesLoading}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sending={sending}
            onSend={handleSendMessage}
            onBack={() => setSelectedConversation(null)}
            formatTime={formatTime}
            formatDate={formatDate}
            messagesEndRef={messagesEndRef}
            isDesktop
          />
        </div>
      )}
      
      {/* Empty state - Desktop */}
      {!isMobile && !selectedConversation && (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--paper)',
          color: 'var(--bark-soft)',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ fontSize: 48 }}>💬</div>
          <div style={{ fontSize: 16 }}>Pilih percakapan untuk melihat detail</div>
        </div>
      )}
    </div>
  )
}

// Chat View Component
interface ChatViewProps {
  conversation: Conversation
  messages: Message[]
  messagesLoading: boolean
  newMessage: string
  setNewMessage: (msg: string) => void
  sending: boolean
  onSend: (e: React.FormEvent) => void
  onBack: () => void
  formatTime: (iso: string) => string
  formatDate: (iso: string) => string
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  isDesktop?: boolean
}

function ChatView({
  conversation,
  messages,
  messagesLoading,
  newMessage,
  setNewMessage,
  sending,
  onSend,
  onBack,
  formatTime,
  formatDate,
  messagesEndRef,
  isDesktop
}: ChatViewProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const getBubbleColor = (senderType: string) => {
    switch (senderType) {
      case 'bot': return { bg: '#e8f5f2', border: '#98d4c8', align: 'flex-start' }
      case 'staff': return { bg: '#ffe8e0', border: '#f5a892', align: 'flex-end' }
      default: return { bg: '#fffbf0', border: '#f5d98a', align: 'flex-start' }
    }
  }
  
  const getSenderLabel = (senderType: string) => {
    switch (senderType) {
      case 'bot': return 'KLH Asisten'
      case 'staff': return 'Staff'
      default: return 'Pengguna'
    }
  }
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {} as Record<string, Message[]>)
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: 'white'
    }}>
      {/* Header - Clickable to expand details */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--line)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer'
        }}
      >
        {!isDesktop && (
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            ← Kembali
          </button>
        )}
        
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: conversation.platform === 'whatsapp'
            ? 'linear-gradient(135deg, #25d366, #128c7e)'
            : 'linear-gradient(135deg, var(--leaf-mid), var(--leaf-deep))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 16,
          fontWeight: 600
        }}>
          {conversation.name?.charAt(0).toUpperCase() || '?'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>
            {conversation.name || 'Anonim'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--bark-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: conversation.status === 'active' ? '#4ade80' : '#9ca3af'
            }} />
            {conversation.status === 'active' ? 'Online' : 'Offline'} · {conversation.phone}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            fontSize: 9,
            padding: '2px 8px',
            borderRadius: 3,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            color: 'var(--bark-soft)',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            {conversation.category}
          </span>
          <span style={{
            fontSize: 14,
            transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>▼</span>
        </div>
      </div>
      
      {/* Expanded Details Panel */}
      {showDetails && (
        <div style={{
          padding: '12px 16px',
          background: '#f8f9fa',
          borderBottom: '1px solid var(--line)',
          fontSize: 12
        }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Phone:</strong> {conversation.phone}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Platform:</strong> {conversation.platform}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Status:</strong> 
            <span style={{
              marginLeft: 6,
              padding: '2px 6px',
              borderRadius: 3,
              background: conversation.status === 'active' ? '#dcfce7' : '#f3f4f6',
              color: conversation.status === 'active' ? '#166534' : '#6b7280',
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              {conversation.status}
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Priority:</strong> {conversation.priority}
          </div>
          <div>
            <strong>Conversation ID:</strong> #{conversation.id}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {messagesLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark-soft)' }}>
            Memuat pesan...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark-soft)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div>Belum ada pesan</div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date divider */}
              <div style={{
                textAlign: 'center',
                margin: '16px 0',
                position: 'relative'
              }}>
                <span style={{
                  background: '#f8f9fa',
                  padding: '0 12px',
                  fontSize: 11,
                  color: 'var(--bark-soft)',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {formatDate(dateMessages[0].created_at)}
                </span>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'var(--line-soft)',
                  zIndex: -1
                }} />
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((msg, idx) => {
                const style = getBubbleColor(msg.sender_type)
                const isStaff = msg.sender_type === 'staff'
                
                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      display: 'flex',
                      justifyContent: style.align as any,
                      marginBottom: 8
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: isStaff ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      padding: '10px 14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isStaff ? 'var(--clay)' : msg.sender_type === 'bot' ? 'var(--leaf-deep)' : 'var(--ink)',
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {getSenderLabel(msg.sender_type)}
                      </div>
                      <div style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--ink)',
                        wordBreak: 'break-word'
                      }}>
                        {msg.content}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: 'var(--bark-soft)',
                        marginTop: 4,
                        textAlign: 'right',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form
        onSubmit={onSend}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--line)',
          background: 'white',
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid var(--line)',
            borderRadius: 20,
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit'
          }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          style={{
            padding: '12px 20px',
            background: 'var(--leaf-deep)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.7 : 1,
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {sending ? '...' : 'Kirim'}
        </button>
      </form>
    </div>
  )
}
