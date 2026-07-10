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

interface Group {
  id: string
  topic: string
  createdAt: string
  advisors: { advisor: Advisor }[]
  _count: { messages: number }
}

export default function GroupPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [topic, setTopic] = useState('')
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/register')
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)
    fetchAdvisors()
    fetchGroups(userObj.id)
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

  async function fetchGroups(userId: string) {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`)
      const data = await res.json()
      setGroups(data.groups || [])
    } catch (e) {
      console.error('Failed to fetch groups:', e)
    }
  }

  function toggleAdvisor(id: string) {
    setSelectedAdvisors(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  async function createGroup() {
    if (!topic.trim() || selectedAdvisors.length === 0 || !user) return

    setLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          topic: topic.trim(),
          advisorIds: selectedAdvisors,
        }),
      })
      const data = await res.json()
      if (data.group) {
        router.push(`/group/${data.group.id}`)
      }
    } catch (e) {
      console.error('Create group error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>群组讨论</h2>
        <button style={styles.addBtn} onClick={() => setShowCreate(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div style={styles.content}>
        {groups.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💬</div>
            <p style={styles.emptyText}>还没有群组</p>
            <p style={styles.emptySubtext}>创建一个群组，让多位智者同时为你出谋划策</p>
          </div>
        ) : (
          <div style={styles.groupList}>
            {groups.map(group => (
              <Link key={group.id} href={`/group/${group.id}`} style={styles.groupCard}>
                <div style={styles.groupHeader}>
                  <h3 style={styles.groupTopic}>{group.topic}</h3>
                  <span style={styles.groupDate}>
                    {new Date(group.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div style={styles.groupAdvisors}>
                  {group.advisors.map((ga, i) => (
                    <span key={i} style={{ fontSize: 18 }}>{ga.advisor.emoji}</span>
                  ))}
                  <span style={styles.advisorCount}>
                    {group.advisors.length}位智者
                  </span>
                </div>
                <p style={styles.messageCount}>
                  {group._count.messages} 条消息
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>创建讨论群组</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>讨论话题</label>
              <input
                type="text"
                className="input"
                placeholder="比如：如何平衡工作和生活？"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>邀请智者（可多选）</label>
              <div style={styles.advisorGrid}>
                {advisors.map(a => (
                  <div
                    key={a.id}
                    style={{
                      ...styles.advisorCard,
                      borderColor: selectedAdvisors.includes(a.id) ? '#FF9A76' : 'transparent',
                      background: selectedAdvisors.includes(a.id) ? '#FFF8F3' : '#FFF',
                    }}
                    onClick={() => toggleAdvisor(a.id)}
                  >
                    <div style={{ ...styles.advisorAvatar, background: a.color }}>
                      {a.emoji}
                    </div>
                    <span style={styles.advisorName}>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              disabled={!topic.trim() || selectedAdvisors.length === 0 || loading}
              onClick={createGroup}
            >
              {loading ? '创建中...' : '创建群组'}
            </button>

            <button style={styles.cancelBtn} onClick={() => setShowCreate(false)}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="tab-bar">
        <Link href="/chat" className="tab-item">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span>聊天</span>
        </Link>
        <Link href="/group" className="tab-item active">
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#5D4E45',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)',
    border: 'none',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
    overflowY: 'auto',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 600,
    color: '#5D4E45',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B7B6B',
  },
  groupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  groupCard: {
    background: '#FFF',
    borderRadius: 16,
    padding: 16,
    textDecoration: 'none',
    display: 'block',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTopic: {
    fontSize: 16,
    fontWeight: 600,
    color: '#5D4E45',
  },
  groupDate: {
    fontSize: 12,
    color: '#B8A899',
  },
  groupAdvisors: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  advisorCount: {
    fontSize: 13,
    color: '#8B7B6B',
    marginLeft: 8,
  },
  messageCount: {
    fontSize: 12,
    color: '#B8A899',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 200,
    padding: 20,
  },
  modal: {
    background: '#FFF',
    borderRadius: '24px 24px 0 0',
    padding: 24,
    width: '100%',
    maxWidth: 393,
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontFamily: "'Noto Serif SC', serif",
    fontSize: 20,
    color: '#5D4E45',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#8B7B6B',
    marginBottom: 8,
    display: 'block',
  },
  advisorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  advisorCard: {
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  advisorAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  advisorName: {
    fontSize: 12,
    color: '#5D4E45',
    textAlign: 'center',
  },
  cancelBtn: {
    width: '100%',
    padding: 14,
    background: 'transparent',
    border: 'none',
    color: '#8B7B6B',
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 8,
  },
}