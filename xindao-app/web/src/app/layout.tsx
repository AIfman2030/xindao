import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '心岛 - 释放你的焦虑与孤独',
  description: 'AI陪伴社交App，通过蒸馏各领域智者的思维框架，为用户提供可落地的行动建议',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}