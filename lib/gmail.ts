import { prisma } from '@/lib/prisma'

interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload?: {
    headers?: Array<{ name: string; value: string }>
    body?: { data?: string }
    parts?: Array<{ mimeType: string; body?: { data?: string } }>
  }
  internalDate?: string
}

interface GmailListResponse {
  messages?: Array<{ id: string }>
  nextPageToken?: string
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[Gmail] Missing OAuth credentials')
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

  if (!res.ok) return null
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

function getHeader(
  headers: Array<{ name: string; value: string }>,
  name: string
): string | undefined {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decodeBase64(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

function classifyPriority(subject: string, fromEmail: string, snippet: string): string {
  const text = `${subject} ${snippet}`.toLowerCase()
  if (
    text.includes('urgente') ||
    text.includes('urgent') ||
    text.includes('asap') ||
    text.includes('immediat')
  )
    return 'urgent'
  if (
    text.includes('importante') ||
    text.includes('scadenza')
  )
    return 'high'
  if (
    fromEmail.includes('noreply') ||
    fromEmail.includes('newsletter') ||
    text.includes('unsubscribe')
  )
    return 'low'
  return 'normal'
}

export async function syncGmail(): Promise<void> {
  const token = await getAccessToken()
  if (!token) return

  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:unread%20in:inbox',
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!listRes.ok) {
    console.error('[Gmail] List error:', await listRes.text())
    return
  }

  const listData = (await listRes.json()) as GmailListResponse
  const messageIds = listData.messages ?? []

  for (const { id } of messageIds) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!msgRes.ok) continue

    const msg = (await msgRes.json()) as GmailMessage
    const headers = msg.payload?.headers ?? []

    const from = getHeader(headers, 'from') ?? ''
    const subject = getHeader(headers, 'subject') ?? ''
    const date = msg.internalDate ? new Date(parseInt(msg.internalDate)) : new Date()

    const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/)
    const fromName = fromMatch ? fromMatch[1].replace(/"/g, '') : null
    const fromEmail = fromMatch ? fromMatch[2] : from

    const priority = classifyPriority(subject, fromEmail, msg.snippet)

    // Deduplicate: skip if we already stored a message from this sender within 1 minute
    const existing = await prisma.email.findFirst({
      where: {
        fromEmail,
        timestamp: { gte: new Date(date.getTime() - 60000) },
      },
    })
    if (existing) continue

    await prisma.email.create({
      data: {
        fromEmail,
        fromName,
        subject,
        bodyPreview: msg.snippet,
        priority,
        read: false,
        timestamp: date,
      },
    })
  }

  console.log(`[Gmail] Synced ${messageIds.length} emails`)
}
