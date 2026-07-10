import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nickname, bio } = body

    console.log('Register request:', { nickname, bio })

    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json({ error: '昵称必填' }, { status: 400 })
    }

    const user = {
      id: 'user_' + Date.now(),
      nickname: nickname.trim().substring(0, 8),
      bio: bio?.trim().substring(0, 20) || null,
      createdAt: new Date().toISOString()
    }

    console.log('Created user:', user)

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: '注册失败: ' + error.message }, { status: 500 })
  }
}