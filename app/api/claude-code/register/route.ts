import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  projectName: z.string().min(1),
  repoUrl: z.string().url().optional(),
  currentFile: z.string().optional(),
  currentTask: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  lastCommit: z.string().optional(),
  companyId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // Simple bearer token auth (uses NEXTAUTH_SECRET as shared secret)
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '').trim()
  const secret = process.env.NEXTAUTH_SECRET ?? ''

  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { projectName, repoUrl, currentFile, currentTask, progress, lastCommit, companyId } =
    parsed.data

  // Upsert by projectName
  const existing = await prisma.ccInstance.findFirst({
    where: { projectName },
  })

  const data = {
    repoUrl: repoUrl ?? null,
    currentFile: currentFile ?? null,
    currentTask: currentTask ?? null,
    progress: progress ?? 0,
    lastCommit: lastCommit ?? null,
    lastUpdate: new Date(),
    companyId: companyId ?? null,
  }

  if (existing) {
    await prisma.ccInstance.update({ where: { id: existing.id }, data })
  } else {
    await prisma.ccInstance.create({ data: { projectName, ...data } })
  }

  return NextResponse.json({ success: true })
}
