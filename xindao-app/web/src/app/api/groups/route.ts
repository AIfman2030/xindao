import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, topic, advisorIds } = await request.json()

    if (!userId || !topic || !advisorIds?.length) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const group = db().createGroup({ topic, userId })

    // Add advisors to group
    const database = db()
    const data = JSON.parse(require('fs').readFileSync(require('path').join(process.cwd(), 'data', 'db.json'), 'utf-8'))
    for (const advisorId of advisorIds) {
      data.groupAdvisors.push({
        id: 'ga_' + Date.now() + Math.random(),
        groupId: group.id,
        advisorId,
        createdAt: new Date().toISOString()
      })
    }
    require('fs').writeFileSync(require('path').join(process.cwd(), 'data', 'db.json'), JSON.stringify(data, null, 2))

    const fullGroup = db().getGroup(group.id)

    return NextResponse.json({ group: fullGroup })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ error: '创建群组失败' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: '需要用户ID' }, { status: 400 })
  }

  try {
    const groups = db().getGroups(userId)
    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json({ groups: [] }, { status: 500 })
  }
}