import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const advisors = db().getAdvisors()
    const formatted = advisors.map(a => ({
      ...a,
      tags: JSON.parse(a.tags),
    }))
    return NextResponse.json({ advisors: formatted })
  } catch (error) {
    console.error('Get advisors error:', error)
    return NextResponse.json({ advisors: [] }, { status: 500 })
  }
}