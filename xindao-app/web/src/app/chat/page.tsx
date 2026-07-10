'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Advisor {
  id: string
  name: string
  emoji: string
  color: string
  tags: string[]
}

interface Message {
  id: string
  role: string
  content: string
  advisorName?: string
  advisorEmoji?: string
  advisorColor?: string
  createdAt: string
  actionCard?: { text: string; time: string; done: boolean }[]
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [actionCard, setActionCard] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/register')
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)

    // Get primary advisor
    fetchAdvisors(userObj.id)
    fetchMessages(userObj.id)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchAdvisors(userId: string) {
    try {
      const res = await fetch('/api/advisors')
      const data = await res.json()
      // Get user's primary advisor
      const userRes = await fetch(`/api/auth?userId=${userId}`)
      const userData = await userRes.json()
      if (userData.user?.advisorId) {
        const primary = data.advisors?.find((a: Advisor) => a.id === userData.user.advisorId)
        setAdvisor(primary || data.advisors?.[0] || null)
      } else {
        setAdvisor(data.advisors?.[0] || null)
      }
    } catch (e) {
      console.error('Failed to fetch advisors:', e)
    }
  }

  async function fetchMessages(userId: string) {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`)
      const data = await res.json()
      setMessages(data.messages || [])

      // Show latest action card if exists
      const latestWithCard = data.messages?.filter((m: Message) => m.actionCard)?.pop()
      if (latestWithCard) {
        setActionCard(latestWithCard.actionCard)
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e)
    }
  }

  async function sendMessage() {
    if (!input.trim() || !user || loading) return

    const text = input
    setInput('')
    setLoading(true)
    setTyping(true)

    // Add user message immediately
    const userMsg: Message = {
      id: 'temp_' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: text,
        }),
      })
      const data = await res.json()

      if (data.aiMessage) {
        setMessages(prev => [...prev, data.aiMessage])
        if (data.aiMessage.actionCard) {
          setActionCard(data.aiMessage.actionCard)
        }
      }
    } catch (e) {
      console.error('Send message error:', e)
    } finally {
      setLoading(false)
      setTyping(false)
    }
  }

  function toggleAction(index: number) {
    if (actionCard) {
      const updated = [...actionCard]
      updated[index].done = !updated[index].done
      setActionCard(updated)

      // Update in database
      fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionIndex: index,
          done: updated[index].done,
        }),
      })
    }
  }

  return (
    <div className="app-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={{ ...styles.avatar, background: advisor?.color || '#FFE4D6' }}>
            {advisor?.emoji || '🌊'}
          </div>
          <div>
            <h2 style={styles.advisorName}>@{advisor?.name || '智者'}</h2>
            <p style={styles.advisorSub}>你的专属智者</p>
          </div>
        </div>
        <Link href="/settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B7B6B" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </Link>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.welcomeBanner}>
            <div style={styles.welcomeHeader}>
              <div style={styles.welcomeAvatar}>🏝️</div>
              <span style={styles.welcomeTitle}>欢迎来到心岛</span>
            </div>
            <p style={styles.welcomeText}>
              Hi {user?.nickname || ''}，你的专属智者 {advisor?.name || '智者'} 已就位。
              无论生活、工作还是感情上的困惑，都可以和他聊聊。
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-avatar" style={{ background: msg.advisorColor || (msg.role === 'user' ? 'linear-gradient(135deg, #FF9A76, #FF7E5F)' : '#FFE4D6') }}>
              {msg.role === 'user' ? '👤' : msg.advisorEmoji || advisor?.emoji}
            </div>
            <div className="message-bubble">
              <p style={{ fontSize: 11, marginBottom: 4, opacity: 0.7 }}>
                {msg.role === 'user' ? user?.nickname : '@' + (msg.advisorName || advisor?.name)} · {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div dangerouslySetInnerHTML={{ __html: msg.content }} />
            </div>
          </div>
        ))}

        {typing && (
          <div className="message ai">
            <div className="message-avatar" style={{ background: advisor?.color || '#FFE4D6' }}>
              {advisor?.emoji}
            </div>
            <div className="message-bubble">
              <div className="typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Action Card */}
        {actionCard && (
          <div style={styles.actionCard}>
            <div style={styles.actionHeader}>
              <span>🎯</span>
              <span style={styles.actionTitle}>今日行动</span>
              <span style={styles.actionBadge}>新鲜生成</span>
            </div>
            {actionCard.map((item: any, i: number) => (
              <div
                key={i}
                style={styles.actionItem}
                onClick={() => toggleAction(i)}
              >
                <div style={{
                  ...styles.actionCheck,
                  background: item.done ? '#FF9A76' : 'transparent',
                  borderColor: item.done ? '#FF7E5F' : '#FF9A76'
                }}>
                  {item.done && <span style={{ color: '#FFF', fontSize: 12 }}>✓</span>}
                </div>
                <span style={{
                  ...styles.actionText,
                  textDecoration: item.done ? 'line-through' : 'none',
                  color: item.done ? '#B8A899' : '#5D4E45'
                }}>
                  {item.text}
                </span>
                <span style={styles.actionTime}>⏰ {item.time}</span>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.tips}>
          <span>💡</span>
          <span>和智者聊完会自动生成行动卡，每日提醒执行</span>
        </div>
        <div style={styles.inputRow}>
          <input
            type="text"
            style={styles.input}
            placeholder="问 @智者 任何问题..."
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

      {/* Tab Bar */}
      <div className="tab-bar">
        <Link href="/chat" className="tab-item active">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span>聊天</span>
        </Link>
        <Link href="/group" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span>群组</span>
        </Link>
        <Link href="/actions" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>进度</span>
        </Link>
        <Link href="/distill" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>蒸馏</span>
        </Link>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  advisorName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#5D4E45',
  },
  advisorSub: {
    fontSize: 12,
    color: '#8B7B6B',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)',
    borderRadius: 20,
    padding: 18,
    color: '#FFF',
  },
  welcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  welcomeAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  welcomeTitle: {
    fontWeight: 600,
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 1.6,
    opacity: 0.95,
  },
  actionCard: {
    background: '#FFF',
    borderRadius: 16,
    padding: 16,
    border: '1px solid #F5EDE6',
    marginTop: 8,
  },
  actionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#5D4E45',
    flex: 1,
  },
  actionBadge: {
    background: '#FFF5EE',
    color: '#FF7E5F',
    padding: '4px 10px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 500,
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #F5EDE6',
    cursor: 'pointer',
  },
  actionCheck: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
  },
  actionTime: {
    fontSize: 12,
    color: '#B8A899',
  },
  inputArea: {
    flexShrink: 0,
    paddingBottom: 80,
  },
  tips: {
    background: 'linear-gradient(135deg, #FFF8F3 0%, #FFF5EE 100%)',
    borderRadius: 12,
    padding: '10px 14px',
    margin: '0 16px 12px',
    fontSize: 12,
    color: '#8B7B6B',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 16px',
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
    boxShadow: '0 4px 16px rgba(255,126,95,0.3)',
  },
}