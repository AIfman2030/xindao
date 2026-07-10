import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAIResponse, generateActionCard } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { userId, content, groupId } = await request.json()

    if (!userId || !content) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const advisor = db().getUserPrimaryAdvisor(userId)
    if (!advisor) {
      return NextResponse.json({ error: '请先选择一位智者' }, { status: 400 })
    }

    // Save user message
    const userMsg = db().createMessage({
      role: 'user',
      content,
      groupId: groupId || null,
      advisorId: advisor.id,
    })

    // Get AI response
    const aiContent = await getAIResponse(advisor.prompt, content)
    const actionItems = await generateActionCard(content)

    // Save AI message
    const aiMsg = db().createMessage({
      role: 'ai',
      content: aiContent,
      advisorId: advisor.id,
      advisorName: advisor.name,
      advisorEmoji: advisor.emoji,
      advisorColor: advisor.color,
      groupId: groupId || null,
      actionCard: JSON.stringify(actionItems),
    })

    // Create actions
    for (const item of actionItems) {
      db().createAction({
        text: item.text,
        groupId: groupId || null,
        userId,
      })
    }

    return NextResponse.json({
      userMessage: userMsg,
      aiMessage: { ...aiMsg, actionCard: actionItems },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get('groupId')

  try {
    const messages = db().getMessages(groupId || undefined)
    const formattedMessages = messages.map((m: any) => ({
      ...m,
      actionCard: m.actionCard ? JSON.parse(m.actionCard) : null,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ messages: [] }, { status: 500 })
  }
}