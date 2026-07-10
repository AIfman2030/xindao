'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface Message {
  id: string
  role: string
  content: string
  advisorId?: string
  advisorName?: string
  advisorEmoji?: string
  advisorColor?: string
  createdAt: string
}

export default function GroupChatPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/register')
      return
    }
    setUser(JSON.parse(userData))
    fetchGroup()
    fetchMessages()
  }, [groupId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchGroup() {
    try {
      const res = await fetch(`/api/groups?userId=${localStorage.getItem('userId')}`)
      const data = await res.json()
      const found = data.groups?.find((g: any) => g.id === groupId)
      setGroup(found)
    } catch (e) {
      console.error('Failed to fetch group:', e)
    }
  }

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/chat?userId=${localStorage.getItem('userId')}&groupId=${groupId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (e) {
      console.error('Failed to fetch messages:', e)
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const text = input
    setInput('')
    setLoading(true)
    setTyping(true)

    const userMsg: Message = {
      id: 'temp_' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch('/api/group/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          content: text,
          userId: localStorage.getItem('userId'),
        }),
      })
      const data = await res.json()

      if (data.aiMessages) {
        setMessages(prev => [...prev, ...data.aiMessages])
      }
    } catch (e) {
      console.error('Send message error:', e)
    } finally {
      setLoading(false)
      setTyping(false)
    }
  }

  return (
    <div className="app-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link href="/group" style={styles.backBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B7B6B" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </Link>
        <div style={styles.headerCenter}>
          <h2 style={styles.topic}>{group?.topic || '群组讨论'}</h2>
          <p style={styles.advisorNames}>
            {group?.advisors?.map((ga: any) => ga.advisor.emoji).join(' ') || ''}
          </p>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <p>发起话题，和多位智者一起讨论</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-avatar" style={{ background: msg.advisorColor || '#FFE4D6' }}>
              {msg.role === 'user' ? '👤' : msg.advisorEmoji}
            </div>
            <div className="message-bubble">
              <p style={{ fontSize: 11, marginBottom: 4, opacity: 0.7 }}>
                {msg.role === 'user' ? user?.nickname : '@' + msg.advisorName} · {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div dangerouslySetInnerHTML={{ __html: msg.content }} />
            </div>
          </div>
        ))}

        {typing && (
          <div className="message ai">
            <div className="message-avatar" style={{ background: '#FFE4D6' }}>⏳</div>
            <div className="message-bubble">
              <div className="typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <input
            type="text"
            style={styles.input}
            placeholder="描述你的困惑..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button style={styles.sendBtn} onClick={sendMessage} disabled={!input.trim() || loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#FFF',
  },
  header: {
    padding: '14px 20px',
    borderBottom: '1px solid #F5EDE6',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  topic: {
    fontSize: 16,
    fontWeight: 600,
    color: '#5D4E45',
  },
  advisorNames: {
    fontSize: 16,
    marginTop: 4,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: 40,
    color: '#8B7B6B',
  },
  inputArea: {
    padding: '12px 16px 24px',
    borderTop: '1px solid #F5EDE6',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: '#F8F4F0',
    borderRadius: 24,
    border: 'none',
    fontSize: 15,
    color: '#5D4E45',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}