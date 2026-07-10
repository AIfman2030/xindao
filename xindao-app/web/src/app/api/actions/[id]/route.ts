import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { actionId, done } = await request.json()

    if (!actionId) {
      return NextResponse.json({ error: '需要行动ID' }, { status: 400 })
    }

    const action = db().updateAction(actionId, {
      done,
      doneAt: done ? new Date().toISOString() : null,
    })

    return NextResponse.json({ action })
  } catch (error) {
    console.error('Update action error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}