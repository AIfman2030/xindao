import nodemailer from 'nodemailer'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export interface ActionReminder {
  text: string
  done: boolean
  createdAt: Date
}

export async function sendDailyReminder(
  to: string,
  actions: ActionReminder[],
  userName: string
): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured, skipping reminder')
    return false
  }

  const pendingActions = actions.filter((a) => !a.done)

  if (pendingActions.length === 0) {
    console.log('No pending actions, skipping reminder')
    return true
  }

  const transporter = createTransporter()

  const html = `
    <div style="font-family: 'Noto Sans SC', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF9A76; font-size: 28px; margin-bottom: 8px;">🏝️ 心岛日报</h1>
        <p style="color: #8B7B6B; font-size: 14px;">Hi ${userName}，今天的行动清单来了</p>
      </div>

      <div style="background: #FFF8F3; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #5D4E45; font-size: 16px; margin-bottom: 16px;">📋 待完成的任务</h2>
        ${pendingActions
          .map(
            (action, i) => `
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F5EDE6;">
            <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #FF9A76; flex-shrink: 0;"></div>
            <span style="color: #5D4E45; font-size: 15px;">${action.text}</span>
          </div>
        `
          )
          .join('')}
      </div>

      <div style="text-align: center; color: #8B7B6B; font-size: 13px;">
        <p>完成的任务越多，你离目标越近 💪</p>
        <p style="margin-top: 8px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/actions" style="color: #FF9A76;">查看详情 →</a>
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #F5EDE6;">
        <p style="color: #B8A899; font-size: 12px;">心岛 · 释放你的焦虑与孤独</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"心岛" <noreply@xindao.app>',
      to,
      subject: `🏝️ ${userName}，今日行动清单 - ${pendingActions.length}个任务待完成`,
      html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function sendActionConfirmed(
  to: string,
  actionText: string,
  userName: string
): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return false
  }

  const transporter = createTransporter()

  const html = `
    <div style="font-family: 'Noto Sans SC', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF9A76; font-size: 28px; margin-bottom: 8px;">✅ 行动已确认</h1>
        <p style="color: #8B7B6B; font-size: 14px;">Hi ${userName}，你的行动清单已更新</p>
      </div>

      <div style="background: #FFF8F3; border-radius: 16px; padding: 20px; text-align: center;">
        <p style="color: #5D4E45; font-size: 18px; margin-bottom: 16px;">${actionText}</p>
        <p style="color: #8B7B6B; font-size: 14px;">智者已为你制定了这个行动计划，加油！</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #8B7B6B; font-size: 13px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/actions" style="color: #FF9A76;">查看完整清单 →</a>
        </p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"心岛" <noreply@xindao.app>',
      to,
      subject: `✅ 行动已确认 - ${actionText.substring(0, 30)}...`,
      html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}