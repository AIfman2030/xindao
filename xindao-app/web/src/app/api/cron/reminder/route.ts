import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendDailyReminder } from '@/lib/email'

export async function GET() {
  try {
    const allUsers = db().getUsersWithPendingActions()

    let sent = 0
    let failed = 0

    for (const user of allUsers) {
      if (!user.email) continue

      const pendingActions = user.actions.filter((a: any) => !a.done)
      if (pendingActions.length === 0) continue

      const success = await sendDailyReminder(user.email, pendingActions, user.nickname)
      if (success) sent++
      else failed++
    }

    return NextResponse.json({
      success: true,
      summary: `Sent ${sent} reminders, ${failed} failed`,
      processed: allUsers.length,
    })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}