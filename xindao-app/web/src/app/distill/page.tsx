'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TAGS = [
  { id: '创业', label: '🚀 创业', emoji: '🚀' },
  { id: '创新', label: '💡 创新', emoji: '💡' },
  { id: '投资', label: '💰 投资', emoji: '💰' },
  { id: '设计', label: '🎨 设计', emoji: '🎨' },
  { id: '学习', label: '📚 学习', emoji: '📚' },
  { id: '职场', label: '💼 职场', emoji: '💼' },
  { id: '幸福', label: '🌈 幸福', emoji: '🌈' },
  { id: '健康', label: '💪 健康', emoji: '💪' },
]

export default function DistillPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(['创业', '创新'])
  const [step, setStep] = useState<'form' | 'progress' | 'success'>('form')
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [newAdvisor, setNewAdvisor] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/register')
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function startDistill() {
    if (!name.trim() || !user) return

    setLoading(true)
    setStep('progress')

    // Progress simulation
    const stages = [
      { text: '正在分析中...', progress: 30 },
      { text: '正在提炼思维框架...', progress: 60 },
      { text: '正在生成Skill...', progress: 90 },
    ]

    for (const stage of stages) {
      setProgressText(stage.text)
      setProgress(stage.progress)
      await new Promise(r => setTimeout(r, 1500))
    }

    try {
      const res = await fetch('/api/distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: name.trim(),
          tags: selectedTags,
        }),
      })
      const data = await res.json()

      if (data.advisor) {
        setNewAdvisor(data.advisor)
        setProgress(100)
        setProgressText('完成！')
        setStep('success')
      }
    } catch (e) {
      console.error('Distill error:', e)
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  function goToChat() {
    router.push('/chat')
  }

  function reset() {
    setStep('form')
    setName('')
    setSelectedTags(['创业', '创新'])
    setProgress(0)
    setNewAdvisor(null)
  }

  return (
    <div className="app-container" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>蒸馏新智者</h2>
      </div>

      <div style={styles.content}>
        {/* Form Step */}
        {step === 'form' && (
          <>
            <div style={styles.iconWrapper}>
              <div style={styles.icon}>🧪</div>
            </div>
            <h3 className="font-serif" style={styles.subtitle}>蒸馏新智者</h3>
            <p style={styles.desc}>
              把任何你欣赏的人蒸馏成AI智者<br />加入你的专属智囊团
            </p>

            <div style={styles.form}>
              <input
                type="text"
                className="input"
                placeholder="输入你想蒸馏的人名"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <div style={styles.tagsLabel}>选择领域标签</div>
              <div style={styles.tags}>
                {TAGS.map(tag => (
                  <span
                    key={tag.id}
                    style={{
                      ...styles.tag,
                      background: selectedTags.includes(tag.id) ? '#FFF5EE' : '#FFF',
                      borderColor: selectedTags.includes(tag.id) ? '#FF9A76' : '#F5EDE6',
                      color: selectedTags.includes(tag.id) ? '#FF7E5F' : '#8B7B6B',
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Preview */}
              {name && (
                <div style={styles.preview}>
                  <div style={styles.previewAvatar}>{name[0]}</div>
                  <div>
                    <p style={styles.previewName}>{name}</p>
                    <p style={styles.previewStatus}>即将加入你的智囊团</p>
                    <div style={styles.previewTags}>
                      {selectedTags.map(t => (
                        <span key={t} className="advisor-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                className="btn-primary"
                disabled={!name.trim() || loading}
                onClick={startDistill}
              >
                <span>⚡</span> 开始蒸馏
              </button>

              <p style={styles.hint}>蒸馏需要3-5分钟，基于公开信息深度调研</p>
            </div>
          </>
        )}

        {/* Progress Step */}
        {step === 'progress' && (
          <div style={styles.progressContainer}>
            <div style={styles.progressIcon}>🧪</div>
            <p style={styles.progressText}>{progressText}</p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && newAdvisor && (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>🎉</div>
            <p style={styles.successName}>{newAdvisor.name} {newAdvisor.emoji}</p>
            <p style={styles.successText}>已加入你的智囊团！</p>
            <button className="btn-primary" onClick={goToChat}>
              开始对话
            </button>
            <button style={styles.resetBtn} onClick={reset}>
              继续蒸馏
            </button>
          </div>
        )}
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
        <Link href="/actions" className="tab-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>进度</span>
        </Link>
        <Link href="/distill" className="tab-item active">
          <svg viewBox="0 0 24 24" fill="currentColor">
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
    padding: 30,
    overflowY: 'auto',
  },
  iconWrapper: {
    textAlign: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    fontSize: 36,
  },
  subtitle: {
    fontSize: 24,
    color: '#5D4E45',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#8B7B6B',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  tagsLabel: {
    fontSize: 13,
    color: '#8B7B6B',
    marginBottom: 8,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    padding: '8px 14px',
    border: '1px solid',
    borderRadius: 20,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  preview: {
    background: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#F5EDE6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 600,
    color: '#5D4E45',
  },
  previewName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#5D4E45',
  },
  previewStatus: {
    fontSize: 12,
    color: '#8B7B6B',
    marginTop: 2,
  },
  previewTags: {
    display: 'flex',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  hint: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: '#B8A899',
  },
  progressContainer: {
    textAlign: 'center',
    padding: 60,
  },
  progressIcon: {
    fontSize: 64,
    marginBottom: 24,
    animation: 'pulse 1s ease-in-out infinite',
  },
  progressText: {
    fontSize: 14,
    color: '#5D4E45',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    background: '#F5EDE6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #FF9A76, #FF7E5F)',
    borderRadius: 2,
    transition: 'width 0.3s',
  },
  successContainer: {
    textAlign: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successName: {
    fontSize: 20,
    fontWeight: 600,
    color: '#5D4E45',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#8B7B6B',
    marginBottom: 32,
  },
  resetBtn: {
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