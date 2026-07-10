'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Advisor {
  id: string
  name: string
  emoji: string
  color: string
  tags: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [advisor, setAdvisor] = useState<string | null>(null)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdvisors()
  }, [])

  async function fetchAdvisors() {
    try {
      const res = await fetch('/api/advisors')
      const data = await res.json()
      setAdvisors(data.advisors || [])
    } catch (e) {
      console.error('Failed to fetch advisors:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!nickname.trim()) return
    setLoading(true)

    try {
      console.log('Sending register request...')
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, bio }),
      })

      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)

      if (data.user) {
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('user', JSON.stringify(data.user))
        setStep(2)
      } else {
        alert(data.error || '注册失败')
      }
    } catch (e) {
      console.error('Registration failed:', e)
      alert('注册失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectAdvisor() {
    if (!advisor) return

    try {
      await fetch('/api/user/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          advisorId: advisor,
        }),
      })

      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.advisorId = advisor
      localStorage.setItem('user', JSON.stringify(user))

      setStep(3)
    } catch (e) {
      console.error('Failed to select advisor:', e)
    }
  }

  function enterApp() {
    router.push('/chat')
  }

  const selectedAdvisor = advisors.find((a) => a.id === advisor)

  return (
    <div className="app-container" style={styles.container}>
      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`} />
      </div>

      {/* Step 1: Nickname */}
      {step === 1 && (
        <div style={styles.stepContent}>
          <h2 className="font-serif" style={styles.title}>
            给自己起个名字
          </h2>
          <p style={styles.subtitle}>这是你在心岛的身份标识</p>

          <div style={styles.form}>
            <label style={styles.label}>昵称</label>
            <input
              type="text"
              className="input"
              placeholder="比如：小明、Alex、阿花"
              maxLength={8}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <div style={styles.hint}>
              <span>💡</span>
              <p>
                一个好记的名字能让你更快融入心岛。也可以用英文名或昵称，重要的是你喜欢。
              </p>
            </div>

            <label style={styles.label}>一句话介绍自己（选填）</label>
            <input
              type="text"
              className="input"
              placeholder="比如：正在创业的产品经理"
              maxLength={20}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <button
              className="btn-primary"
              disabled={!nickname.trim() || loading}
              onClick={handleRegister}
            >
              {loading ? '注册中...' : '下一步 →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Advisor */}
      {step === 2 && (
        <div style={styles.stepContent}>
          <div style={styles.chooseHeader}>
            <h2 className="font-serif" style={styles.title}>
              选一位专属智者
            </h2>
            <p style={styles.subtitle}>他将陪你思考、帮你决策，只选一位</p>
          </div>

          <div style={styles.advisorGrid}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#8B7B6B' }}>加载中...</p>
            ) : (
              advisors.map((a) => (
                <div
                  key={a.id}
                  className={`advisor-card ${advisor === a.id ? 'selected' : ''}`}
                  onClick={() => setAdvisor(a.id)}
                >
                  <div
                    className="advisor-avatar"
                    style={{ background: a.color }}
                  >
                    {a.emoji}
                  </div>
                  <div className="advisor-info">
                    <p className="advisor-name">{a.name}</p>
                    <div className="advisor-tags">
                      {a.tags.map((tag) => (
                        <span key={tag} className="advisor-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="btn-primary"
            disabled={!advisor}
            onClick={handleSelectAdvisor}
          >
            开始心岛之旅 →
          </button>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <div style={styles.stepContent}>
          <div style={styles.completeContent}>
            <div style={styles.completeIcon}>🏝️</div>
            <h2 className="font-serif" style={styles.completeTitle}>
              欢迎来到心岛！
            </h2>
            <p style={styles.completeText}>
              你的专属智者{' '}
              <span style={styles.advisorName}>{selectedAdvisor?.name}</span>{' '}
              已就位
            </p>
            <button className="btn-primary" onClick={enterApp}>
              进入心岛
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#FFF8F3',
    padding: '30px 24px',
  },
  stepContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 26,
    color: '#5D4E45',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B7B6B',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 13,
    color: '#8B7B6B',
    marginBottom: 8,
    display: 'block',
  },
  hint: {
    background: '#FFF5EE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  chooseHeader: {
    textAlign: 'center',
    marginBottom: 32,
  },
  advisorGrid: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    overflowY: 'auto',
    marginBottom: 20,
  },
  completeContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    color: '#5D4E45',
    marginBottom: 12,
  },
  completeText: {
    color: '#8B7B6B',
    marginBottom: 32,
  },
  advisorName: {
    color: '#FF7E5F',
    fontWeight: 600,
  },
}