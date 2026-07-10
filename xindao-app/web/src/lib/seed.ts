import { prisma } from '@/lib/prisma'
import { DEFAULT_ADVISORS } from '@/lib/advisors'

export async function seedAdvisors() {
  for (const advisor of DEFAULT_ADVISORS) {
    const existing = await prisma.advisor.findUnique({
      where: { id: advisor.id },
    })

    if (!existing) {
      await prisma.advisor.create({
        data: {
          id: advisor.id,
          name: advisor.name,
          nameEn: advisor.nameEn,
          emoji: advisor.emoji,
          color: advisor.color,
          tags: JSON.stringify(advisor.tags),
          prompt: advisor.prompt,
          isCustom: advisor.isCustom,
        },
      })
    }
  }
}