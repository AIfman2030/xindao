import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: '需要用户ID' }, { status: 400 })
  }

  try {
    const actions = db().getActions(userId)
    const done = actions.filter((a: any) => a.done).length
    const total = actions.length
    const pending = total - done

    // Calculate streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sortedDone = actions
      .filter((a: any) => a.done && a.doneAt)
      .sort((a: any, b: any) => new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime())

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const nextDate = new Date(checkDate)
      nextDate.setDate(nextDate.getDate() + 1)

      const hasDone = sortedDone.some((a: any) => {
        const doneDate = new Date(a.doneAt)
        return doneDate >= checkDate && doneDate < nextDate
      })

      if (hasDone) streak++
      else if (i > 0) break
    }

    return NextResponse.json({
      actions,
      stats: { done, pending, total, streak },
    })
  } catch (error) {
    console.error('Get actions error:', error)
    return NextResponse.json({ actions: [], stats: { done: 0, pending: 0, total: 0, streak: 0 } }, { status: 500 })
  }
}