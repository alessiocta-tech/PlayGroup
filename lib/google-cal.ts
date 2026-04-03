import { prisma } from '@/lib/prisma'

interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  location?: string
  start: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[GoogleCal] Missing OAuth credentials')
    return null
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    console.error('[GoogleCal] Token refresh failed:', await res.text())
    return null
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function syncGoogleCalendar(): Promise<void> {
  const token = await getAccessToken()
  if (!token) return

  const now = new Date()
  const oneMonthLater = new Date(now)
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('timeMin', now.toISOString())
  url.searchParams.set('timeMax', oneMonthLater.toISOString())
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '50')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    console.error('[GoogleCal] API error:', await res.text())
    return
  }

  const data = (await res.json()) as { items: GoogleCalendarEvent[] }
  const events = data.items ?? []

  for (const event of events) {
    const startStr = event.start.dateTime ?? event.start.date
    if (!startStr) continue
    const startAt = new Date(startStr)
    const endStr = event.end?.dateTime ?? event.end?.date
    const allDay = !event.start.dateTime

    const existing = await prisma.event.findFirst({
      where: { googleEventId: event.id },
    })

    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          title: event.summary ?? '(senza titolo)',
          description: event.description ?? null,
          location: event.location ?? null,
          startAt,
          endAt: endStr ? new Date(endStr) : null,
          allDay,
        },
      })
    } else {
      await prisma.event.create({
        data: {
          googleEventId: event.id,
          title: event.summary ?? '(senza titolo)',
          description: event.description ?? null,
          location: event.location ?? null,
          startAt,
          endAt: endStr ? new Date(endStr) : null,
          allDay,
          type: 'personal',
        },
      })
    }
  }

  console.log(`[GoogleCal] Synced ${events.length} events`)
}
