import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, advisorId } = await request.json()

    if (!userId || !advisorId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const advisor = db().getAdvisor(advisorId)
    if (!advisor) {
      return NextResponse.json({ error: '智者不存在' }, { status: 404 })
    }

    const user = db().getUser(userId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    db().addUserAdvisor(userId, advisorId, true)

    return NextResponse.json({
      success: true,
      advisor: {
        id: advisor.id,
        name: advisor.name,
        emoji: advisor.emoji,
        color: advisor.color,
        tags: JSON.parse(advisor.tags),
      },
    })
  } catch (error) {
    console.error('Select advisor error:', error)
    return NextResponse.json({ error: '选择智者失败' }, { status: 500 })
  }
}