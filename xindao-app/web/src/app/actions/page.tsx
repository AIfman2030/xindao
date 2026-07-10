'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Action {
  id: string
  text: string
  done: boolean
  doneAt?: string
  createdAt: string
}

interface Stats {
  done: number
  pending: number
  total: number
  streak: number
}

export default function ActionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [actions, setActions] = useState<Action[]>([])
  const [stats, setStats] = useState<Stats>({ done: 0, pending: 0, total: 0, streak: 0 })
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/register')
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)
    fetchActions(userObj.id)
  }, [])

  async function fetchActions(userId: string) {
    try {
      const res = await fetch(`/api/actions?userId=${userId}`)
      const data = await res.json()
      setActions(data.actions || [])
      setStats(data.stats || { done: 0, pending: 0, total: 0, streak: 0 })
    } catch (e) {
      console.error('Failed to fetch actions:', e)
    }
  }

  async function toggleAction(action: Action) {
    try {
      await fetch(`/api/actions/${action.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: action.id, done: !action.done }),
      })

      setActions(prev =>
        prev.map(a => a.id === action.id ? { ...a, done: !a.done, doneAt: !a.done ? new Date().toISOString() : undefined } : a)
      )
      setStats(prev => ({
        ...prev,
        done: !action.done ? prev.done + 1 : prev.done - 1,
        pending: !action.done ? prev.pending - 1 : prev.pending + 1,
      }))
    } catch (e) {
      console.error('Toggle action error:', e)
    }
  }

  const filteredActions = actions.filter(a => {
    if (filter === 'pending') return !a.done
    if (filter === 'done') return a.done
    return true
  })

  const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="app-container" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>我的进度</h2>
      </div>

      <div style={styles.content}>
        {/* Stats Card */}
        <div style={styles.statsCard}>
          <div style={styles.statsHeader}>
            <span style={styles.statsTitle}>本周行动完成率</span>
            <span style={styles.statsPeriod}>
              {new Date().toLocaleDateString('zh-CN', { month: 'long' })}第{Math.ceil(new Date().getDate() / 7)}周
            </span>
          </div>
          <div style={styles.statsMain}>
            <div className="stats-circle">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle className="circle-bg" cx="50" cy="50" r="42" />
                <circle className="circle-fill" cx="50" cy="50" r="42"
                  style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
              </svg>
              <div className="circle-text">
                <div className="circle-percent">{percent}%</div>
                <div className="circle-label">完成率</div>
              </div>
            </div>
            <div style={styles.statsDetails}>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>已完成</span>
                <span style={{ ...styles.statValue, color: '#FF7E5F' }}>{stats.done}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>进行中</span>
                <span style={styles.statValue}>{stats.pending}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>未开始</span>
                <span style={styles.statValue}>{stats.total - stats.done - stats.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div style={styles.streakCard}>
          <div style={styles.streakFire}>🔥</div>
          <div style={styles.streakInfo}>
            <div style={styles.streakNumber}>{stats.streak}</div>
            <div style={styles.streakLabel}>天连续行动</div>
          </div>
          <div style={styles.streakDots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{
                ...styles.streakDot,
                background: i < (stats.streak % 7) ? '#FF9A76' : '#F5EDE6'
              }} />
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {(['all', 'pending', 'done'] as const).map(f => (
            <button
              key={f}
              style={{
                ...styles.filterTab,
                background: filter === f ? 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)' : 'transparent',
                color: filter === f ? '#FFF' : '#8B7B6B',
              }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待完成' : '已完成'}
            </button>
          ))}
        </div>

        {/* Action List */}
        <div style={styles.actionList}>
          {filteredActions.length === 0 ? (
            <div style={styles.empty}>
              <p>还没有任务</p>
            </div>
          ) : (
            filteredActions.map(action => (
              <div
                key={action.id}
                style={styles.actionItem}
                onClick={() => toggleAction(action)}
              >
                <div style={{
                  ...styles.actionCheck,
                  background: action.done ? '#FF9A76' : 'transparent',
                  borderColor: action.done ? '#FF7E5F' : '#FF9A76'
                }}>
                  {action.done && <span style={{ color: '#FFF', fontSize: 12 }}>✓</span>}
                </div>
                <div style={styles.actionContent}>
                  <span style={{
                    ...styles.actionText,
                    textDecoration: action.done ? 'line-through' : 'none',
                    color: action.done ? '#B8A899' : '#5D4E45'
                  }}>
                    {action.text}
                  </span>
                  <span style={styles.actionDate}>
                    {action.done && action.doneAt
                      ? `完成于 ${new Date(action.doneAt).toLocaleDateString('zh-CN')}`
                      : `创建于 ${new Date(action.createdAt).toLocaleDateString('zh-CN')}`
                    }
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <Link href="/chat" className="tab-item">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span>聊天</span>
        </Link>
        <Link href="/group" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <span>群组</span>
        </Link>
        <Link href="/actions" className="tab-item active">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
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
    minHeight: '100vh',
    background: '#FFF8F3',
  },
  header: {
    padding: '14px 20px',
    background: '#FFF',
    borderBottom: '1px solid #F5EDE6',
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
    paddingBottom: 100,
  },
  statsCard: {
    background: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  statsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 15,
    color: '#5D4E45',
    fontWeight: 600,
  },
  statsPeriod: {
    fontSize: 12,
    color: '#B8A899',
  },
  statsMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  statsDetails: {
    flex: 1,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F5EDE6',
  },
  statLabel: {
    fontSize: 14,
    color: '#8B7B6B',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#5D4E45',
  },
  streakCard: {
    background: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  streakFire: {
    width: 56,
    height: 56,
    background: 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: '#5D4E45',
  },
  streakLabel: {
    fontSize: 13,
    color: '#8B7B6B',
  },
  streakDots: {
    display: 'flex',
    gap: 6,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
  },
  filterTabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    padding: '8px 16px',
    borderRadius: 20,
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionList: {
    background: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
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
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    display: 'block',
    marginBottom: 4,
  },
  actionDate: {
    fontSize: 12,
    color: '#B8A899',
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#8B7B6B',
  },
}