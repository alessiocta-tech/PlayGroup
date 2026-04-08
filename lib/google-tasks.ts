import { prisma } from '@/lib/prisma'
import { getAccessToken } from '@/lib/gmail'

interface GoogleTaskList {
  id: string
  title: string
}

interface GoogleTask {
  id: string
  title: string
  notes?: string
  due?: string
  status: 'needsAction' | 'completed'
}

interface TaskListsResponse {
  items?: GoogleTaskList[]
}

interface TasksResponse {
  items?: GoogleTask[]
}

interface SyncTasksResult {
  synced: number
  skipped: number
  total: number
}

export async function syncGoogleTasks(): Promise<SyncTasksResult> {
  const tokenResult = await getAccessToken()
  if ('error' in tokenResult) {
    throw new Error(tokenResult.error)
  }
  const token = tokenResult.token

  // Step 1: get all task lists
  const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!listsRes.ok) {
    const errText = await listsRes.text()
    console.error('[GoogleTasks] Lists API error:', errText)
    throw new Error(`Tasks Lists API error: ${errText}`)
  }

  const listsData = (await listsRes.json()) as TaskListsResponse
  const taskLists = listsData.items ?? []

  let synced = 0
  let skipped = 0
  let total = 0

  for (const list of taskLists) {
    const tasksUrl = new URL(
      `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks`
    )
    tasksUrl.searchParams.set('showCompleted', 'false')
    tasksUrl.searchParams.set('maxResults', '100')

    const tasksRes = await fetch(tasksUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!tasksRes.ok) {
      const errText = await tasksRes.text()
      console.error(`[GoogleTasks] Tasks API error for list "${list.title}":`, errText)
      continue
    }

    const tasksData = (await tasksRes.json()) as TasksResponse
    const tasks = tasksData.items ?? []
    total += tasks.length

    for (const task of tasks) {
      if (!task.title?.trim()) {
        skipped++
        continue
      }

      const title = task.title.trim()
      const description = task.notes?.trim() ?? null
      const status = task.status === 'completed' ? 'done' : 'open'
      const dueDate = task.due ? new Date(task.due) : null

      // Dedup key: title + dueDate (Task model has no external ID field)
      const existing = await prisma.task.findFirst({
        where: {
          title,
          dueDate: dueDate ?? undefined,
          companyId: null,
        },
      })

      if (existing) {
        await prisma.task.update({
          where: { id: existing.id },
          data: {
            description,
            status,
            dueDate,
          },
        })
      } else {
        await prisma.task.create({
          data: {
            title,
            description,
            status,
            dueDate,
            priority: 'medium',
            companyId: null,
          },
        })
      }
      synced++
    }
  }

  console.log(`[GoogleTasks] Synced ${synced}, skipped ${skipped} of ${total} total`)
  return { synced, skipped, total }
}
