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

async function getAccessToken(): Promise<{ token: string } | { error: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return { error: 'Missing OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN)' }
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

  const data = await res.json() as { access_token?: string; error?: string; error_description?: string }
  if (!res.ok || !data.access_token) {
    const msg = data.error_description ?? data.error ?? `HTTP ${res.status}`
    console.error('[Gmail] Token refresh failed:', msg)
    return { error: `Token refresh failed: ${msg}` }
  }
  return { token: data.access_token }
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

interface SyncResult {
  success: boolean
  synced?: number
  skipped?: number
  total?: number
  error?: string
  gmailError?: string
}

export async function syncGmailWithResult(): Promise<SyncResult> {
  const tokenResult = await getAccessToken()
  if ('error' in tokenResult) {
    return { success: false, error: tokenResult.error }
  }
  const token = tokenResult.token

  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=in:inbox',
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!listRes.ok) {
    const errText = await listRes.text()
    console.error('[Gmail] List error:', errText)
    return { success: false, gmailError: errText }
  }

  const listData = (await listRes.json()) as GmailListResponse
  const messageIds = listData.messages ?? []
  let synced = 0
  let skipped = 0

  for (const { id } of messageIds) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!msgRes.ok) { skipped++; continue }

    const msg = (await msgRes.json()) as GmailMessage & { labelIds?: string[] }
    const headers = msg.payload?.headers ?? []

    const from = getHeader(headers, 'from') ?? ''
    const subject = getHeader(headers, 'subject') ?? ''
    const date = msg.internalDate ? new Date(parseInt(msg.internalDate)) : new Date()

    const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/)
    const fromName = fromMatch ? fromMatch[1].replace(/"/g, '') : null
    const fromEmail = fromMatch ? fromMatch[2] : from

    const priority = classifyPriority(subject, fromEmail, msg.snippet)

    const existing = await prisma.email.findFirst({
      where: {
        fromEmail,
        timestamp: { gte: new Date(date.getTime() - 30000) },
      },
    })
    if (existing) { skipped++; continue }

    const isRead = msg.labelIds?.includes('UNREAD') === false

    await prisma.email.create({
      data: {
        fromEmail,
        fromName,
        subject,
        bodyPreview: msg.snippet,
        priority,
        read: isRead,
        timestamp: date,
      },
    })
    synced++
  }

  console.log(`[Gmail] Synced ${synced} new, skipped ${skipped} of ${messageIds.length}`)
  return { success: true, synced, skipped, total: messageIds.length }
}

export async function syncGmail(): Promise<void> {
  await syncGmailWithResult()
}
