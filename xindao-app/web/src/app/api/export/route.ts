import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const format = searchParams.get('format') || 'json'

  if (!userId) {
    return NextResponse.json({ error: '需要用户ID' }, { status: 400 })
  }

  try {
    const user = db().getUser(userId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const actions = db().getActions(userId)
    const groups = db().getGroups(userId)
    const advisors = db().getAdvisors()

    if (format === 'markdown') {
      let md = `# ${user.nickname} 的心岛数据\n\n`
      md += `> 导出时间：${new Date().toLocaleString('zh-CN')}\n\n`

      if (user.bio) md += `## 个人介绍\n${user.bio}\n\n`

      const doneActions = actions.filter((a: any) => a.done)
      const pendingActions = actions.filter((a: any) => !a.done)

      if (doneActions.length > 0) {
        md += `## ✅ 已完成 (${doneActions.length})\n`
        for (const action of doneActions.slice(0, 50)) {
          md += `- [x] ${action.text}\n`
        }
        md += '\n'
      }

      if (pendingActions.length > 0) {
        md += `## 📋 待完成 (${pendingActions.length})\n`
        for (const action of pendingActions) {
          md += `- [ ] ${action.text}\n`
        }
        md += '\n'
      }

      return new NextResponse(md, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${user.nickname}_心岛数据.md"`,
        },
      })
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: { nickname: user.nickname, bio: user.bio, createdAt: user.createdAt },
      actions: { total: actions.length, done: actions.filter((a: any) => a.done).length, items: actions },
      groups: groups.map((g: any) => ({
        topic: g.topic,
        createdAt: g.createdAt,
        advisors: g.advisors?.map((a: any) => a.advisor?.name) || [],
      })),
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: '导出失败' }, { status: 500 })
  }
}