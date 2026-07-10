'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Advisor {
  id: string
  name: string
  emoji: string
  color: string
  tags: string[]
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [currentAdvisor, setCurrentAdvisor] = useState<string>('')
  const [apiKey, setApiKey] = useState('')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/register')
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)
    setCurrentAdvisor(userObj.advisorId || '')

    // Load saved settings
    setApiKey(localStorage.getItem('xindao_api_key') || '')
    setEmail(localStorage.getItem('xindao_email') || userObj.email || '')

    fetchAdvisors()
  }, [])

  async function fetchAdvisors() {
    try {
      const res = await fetch('/api/advisors')
      const data = await res.json()
      setAdvisors(data.advisors || [])
    } catch (e) {
      console.error('Failed to fetch advisors:', e)
    }
  }

  async function switchAdvisor(advisorId: string) {
    if (!user) return

    try {
      await fetch('/api/user/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          advisorId,
        }),
      })

      user.advisorId = advisorId
      localStorage.setItem('user', JSON.stringify(user))
      setCurrentAdvisor(advisorId)
      showSaved('智者已切换')
    } catch (e) {
      console.error('Switch advisor error:', e)
    }
  }

  function saveSettings() {
    localStorage.setItem('xindao_api_key', apiKey)
    localStorage.setItem('xindao_email', email)
    showSaved('设置已保存')
  }

  function showSaved(msg: string) {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function exportData(format: 'json' | 'markdown') {
    if (!user) return
    window.open(`/api/export?userId=${user.id}&format=${format}`, '_blank')
  }

  function clearData() {
    if (confirm('确定要清除所有数据吗？这将重置你的账号和进度。')) {
      localStorage.removeItem('user')
      localStorage.removeItem('userId')
      localStorage.removeItem('xindao_state')
      router.push('/')
    }
  }

  const selectedAdvisor = advisors.find(a => a.id === currentAdvisor)

  return (
    <div className="app-container" style={styles.container}>
      <div style={styles.header}>
        <Link href="/chat" style={styles.backBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B7B6B" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </Link>
        <h2 style={styles.title}>设置</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={styles.content}>
        {/* User Info */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>👤 用户信息</div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>昵称</span>
            <span style={styles.infoValue}>{user?.nickname}</span>
          </div>
          {user?.bio && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>介绍</span>
              <span style={styles.infoValue}>{user.bio}</span>
            </div>
          )}
        </div>

        {/* Advisor Selection */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🧙 切换智者</div>
          <div style={styles.advisorList}>
            {advisors.map(a => (
              <div
                key={a.id}
                style={{
                  ...styles.advisorItem,
                  background: currentAdvisor === a.id ? '#FFF8F3' : '#FFF',
                  borderColor: currentAdvisor === a.id ? '#FF9A76' : 'transparent',
                }}
                onClick={() => switchAdvisor(a.id)}
              >
                <div style={{ ...styles.advisorAvatar, background: a.color }}>
                  {a.emoji}
                </div>
                <span style={styles.advisorName}>{a.name}</span>
                {currentAdvisor === a.id && (
                  <span style={styles.primaryBadge}>主</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email Reminder */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>📧 邮件提醒</div>
          <input
            type="email"
            className="input"
            placeholder="输入邮箱地址"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <p style={styles.hint}>设置邮箱后，每天会收到待办事项提醒</p>
        </div>

        {/* API Key */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🔑 API Key（可选）</div>
          <input
            type="password"
            className="input"
            placeholder="填入你的 OpenAI API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <p style={styles.hint}>
            不填则使用内置 Mock 回复。填入后可获得更智能的AI对话体验。
          </p>
        </div>

        {/* Export */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>📤 导出数据</div>
          <div style={styles.exportBtns}>
            <button style={styles.exportBtn} onClick={() => exportData('json')}>
              导出 JSON
            </button>
            <button style={styles.exportBtn} onClick={() => exportData('markdown')}>
              导出 Markdown
            </button>
          </div>
        </div>

        <button className="btn-primary" onClick={saveSettings}>
          保存设置
        </button>

        <button style={styles.clearBtn} onClick={clearData}>
          清除所有数据
        </button>
      </div>

      {/* Toast */}
      {saved && (
        <div style={styles.toast}>设置已保存 ✨</div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#FFF8F3',
  },
  header: {
    padding: '14px 20px',
    background: '#FFF',
    borderBottom: '1px solid #F5EDE6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#5D4E45',
  },
  content: {
    flex: 1,
    padding: 20,
    overflowY: 'auto',
    paddingBottom: 40,
  },
  card: {
    background: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#5D4E45',
    marginBottom: 12,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #F5EDE6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8B7B6B',
  },
  infoValue: {
    fontSize: 14,
    color: '#5D4E45',
  },
  advisorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  advisorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  advisorAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  advisorName: {
    flex: 1,
    fontSize: 14,
    color: '#5D4E45',
  },
  primaryBadge: {
    background: '#FF9A76',
    color: '#FFF',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
  },
  hint: {
    fontSize: 12,
    color: '#8B7B6B',
    lineHeight: 1.5,
  },
  exportBtns: {
    display: 'flex',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    padding: 12,
    background: '#F5EDE6',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    color: '#5D4E45',
    cursor: 'pointer',
  },
  clearBtn: {
    width: '100%',
    padding: 14,
    background: 'transparent',
    border: 'none',
    color: '#FF6B6B',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 20,
  },
  toast: {
    position: 'fixed',
    bottom: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)',
    color: '#FFF',
    padding: '12px 24px',
    borderRadius: 24,
    fontSize: 14,
    zIndex: 200,
  },
}