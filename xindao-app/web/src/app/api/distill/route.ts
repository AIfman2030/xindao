import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { distillPerson } from '@/lib/nuwa'

export async function POST(request: NextRequest) {
  try {
    const { userId, name, tags } = await request.json()

    if (!userId || !name) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // Create distill task
    const task = db().createDistillTask({
      userId,
      name,
      tags: JSON.stringify(tags || []),
      status: 'processing',
      progress: 10,
    })

    // Run nuwa distillation process
    const result = await distillPerson(name, tags || [], (progress: number, message: string) => {
      db().updateDistillTask(task.id, { progress, status: message.includes('完成') ? 'completed' : 'processing' })
    })

    if (result.error) {
      db().updateDistillTask(task.id, { status: 'failed', error: result.error })
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Create new advisor with distilled skill
    const advisor = db().createAdvisor({
      name,
      nameEn: name,
      emoji: result.emoji,
      color: result.color,
      tags: JSON.stringify(tags || result.tags),
      prompt: result.prompt,
      isCustom: true,
      status: 'ready',
    })

    // Link to user
    db().addUserAdvisor(userId, advisor.id, false)

    // Complete task
    db().updateDistillTask(task.id, {
      status: 'completed',
      progress: 100,
      advisorId: advisor.id,
      completedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      task,
      advisor: {
        id: advisor.id,
        name: advisor.name,
        emoji: advisor.emoji,
        color: advisor.color,
        tags: JSON.parse(advisor.tags),
      },
    })
  } catch (error: any) {
    console.error('Distill error:', error)
    return NextResponse.json({ error: '蒸馏失败: ' + error.message }, { status: 500 })
  }
}