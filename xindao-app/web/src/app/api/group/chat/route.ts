import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAIResponse } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { groupId, content, userId } = await request.json()

    if (!groupId || !content) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const group = db().getGroup(groupId)
    if (!group) {
      return NextResponse.json({ error: '群组不存在' }, { status: 404 })
    }

    // Save user message
    const userMsg = db().createMessage({
      role: 'user',
      content,
      groupId,
    })

    // Get responses from all advisors
    const aiMessages = []
    for (const ga of group.advisors) {
      const advisor = ga.advisor
      if (!advisor) continue

      const response = await getAIResponse(
        `${advisor.prompt}\n\n这是一个群组讨论场景，用户的问题是关于"${group.topic}"。请针对这个话题给出你的建议。`,
        content
      )

      const aiMsg = db().createMessage({
        role: 'ai',
        content: response,
        advisorId: advisor.id,
        advisorName: advisor.name,
        advisorEmoji: advisor.emoji,
        advisorColor: advisor.color,
        groupId,
      })

      aiMessages.push({
        ...aiMsg,
        advisor: {
          id: advisor.id,
          name: advisor.name,
          emoji: advisor.emoji,
          color: advisor.color,
        },
      })
    }

    return NextResponse.json({
      userMessage: userMsg,
      aiMessages,
    })
  } catch (error) {
    console.error('Group chat error:', error)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}