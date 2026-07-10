'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="app-container" style={styles.container}>
      {/* Splash Screen */}
      <div style={styles.splash}>
        <div style={styles.iconWrapper}>
          <div style={styles.icon}>
            <svg viewBox="0 0 60 60" fill="none" style={{ width: 70, height: 70 }}>
              <path
                d="M30 8C30 8 18 18 18 30C18 42 30 52 30 52C30 52 42 42 42 30C42 18 30 8 30 8Z"
                fill="#FFF"
                fillOpacity="0.9"
              />
              <path
                d="M22 54C22 54 10 50 6 56C6 56 14 62 22 58"
                fill="#FFF"
                fillOpacity="0.6"
              />
              <path
                d="M38 54C38 54 50 50 54 56C54 56 46 62 38 58"
                fill="#FFF"
                fillOpacity="0.6"
              />
            </svg>
          </div>
        </div>

        <h1 style={styles.title}>心岛</h1>
        <p style={styles.tagline}>
          释放你的焦虑与孤独
          <br />
          在这里，你不再是一个人
        </p>

        <div style={styles.actions}>
          <Link href="/register" className="btn-primary" style={styles.primaryBtn}>
            开始探索
          </Link>
          <Link href="/chat" className="btn-secondary" style={styles.secondaryBtn}>
            已有账号，直接进入
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🧙</span>
          <h3>智者陪伴</h3>
          <p>5位智者随时为你答疑</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🎯</span>
          <h3>行动导向</h3>
          <p>从困惑到行动，只需一步</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📧</span>
          <h3>每日提醒</h3>
          <p>邮件提醒，不让计划落空</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .icon {
          animation: breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFF8F3 0%, #FFE8D6 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 24px',
  },
  splash: {
    textAlign: 'center',
    animation: 'fadeIn 0.6s ease',
  },
  iconWrapper: {
    marginBottom: 40,
  },
  icon: {
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF9A76 0%, #FF7E5F 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    boxShadow: '0 20px 60px rgba(255,126,95,0.35)',
  },
  title: {
    fontFamily: "'Noto Serif SC', serif",
    fontSize: 42,
    color: '#5D4E45',
    marginBottom: 16,
    letterSpacing: '0.2em',
  },
  tagline: {
    color: '#8B7B6B',
    fontSize: 16,
    lineHeight: 1.8,
    marginBottom: 60,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  primaryBtn: {
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
  },
  secondaryBtn: {
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
    background: 'transparent',
    border: 'none',
    color: '#8B7B6B',
    fontSize: 14,
    cursor: 'pointer',
    padding: '12px',
  },
  features: {
    display: 'flex',
    gap: 16,
    marginTop: 60,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureCard: {
    background: '#FFF',
    borderRadius: 16,
    padding: '20px 16px',
    textAlign: 'center',
    width: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  featureIcon: {
    fontSize: 28,
    display: 'block',
    marginBottom: 8,
  },
}