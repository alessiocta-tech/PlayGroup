import { prisma } from '@/lib/prisma'
import { getAccessToken } from '@/lib/gmail'

interface PeopleConnection {
  resourceName: string
  names?: Array<{ displayName: string }>
  emailAddresses?: Array<{ value: string }>
  phoneNumbers?: Array<{ value: string }>
  organizations?: Array<{ name?: string; title?: string }>
  biographies?: Array<{ value: string }>
}

interface PeopleListResponse {
  connections?: PeopleConnection[]
  nextPageToken?: string
  totalItems?: number
}

interface SyncContactsResult {
  synced: number
  skipped: number
  total: number
}

export async function syncGoogleContacts(): Promise<SyncContactsResult> {
  const tokenResult = await getAccessToken()
  if ('error' in tokenResult) {
    throw new Error(tokenResult.error)
  }
  const token = tokenResult.token

  const url = new URL('https://people.googleapis.com/v1/people/me/connections')
  url.searchParams.set('personFields', 'names,emailAddresses,phoneNumbers,organizations,biographies')
  url.searchParams.set('pageSize', '100')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[GoogleContacts] API error:', errText)
    throw new Error(`People API error: ${errText}`)
  }

  const data = (await res.json()) as PeopleListResponse
  const connections = data.connections ?? []

  let synced = 0
  let skipped = 0

  for (const person of connections) {
    const name = person.names?.[0]?.displayName?.trim()
    const email = person.emailAddresses?.[0]?.value?.trim() ?? null
    const phone = person.phoneNumbers?.[0]?.value?.trim() ?? null
    const company = person.organizations?.[0]?.name?.trim() ?? null
    const role = person.organizations?.[0]?.title?.trim() ?? null
    const notes = person.biographies?.[0]?.value?.trim() ?? null

    // Skip contacts with no name — cannot create a meaningful record
    if (!name) {
      skipped++
      continue
    }

    if (email) {
      // Upsert by email (unique key)
      const existing = await prisma.contact.findFirst({
        where: { email },
      })

      if (existing) {
        await prisma.contact.update({
          where: { id: existing.id },
          data: {
            name,
            phone,
            company,
            role,
            notes,
          },
        })
      } else {
        await prisma.contact.create({
          data: {
            name,
            email,
            phone,
            company,
            role,
            notes,
          },
        })
      }
      synced++
    } else {
      // No email — use name as dedup key
      const existing = await prisma.contact.findFirst({
        where: { name, email: null },
      })

      if (existing) {
        await prisma.contact.update({
          where: { id: existing.id },
          data: {
            phone,
            company,
            role,
            notes,
          },
        })
      } else {
        await prisma.contact.create({
          data: {
            name,
            email: null,
            phone,
            company,
            role,
            notes,
          },
        })
      }
      synced++
    }
  }

  console.log(
    `[GoogleContacts] Synced ${synced}, skipped ${skipped} of ${connections.length} total`
  )
  return { synced, skipped, total: connections.length }
}
