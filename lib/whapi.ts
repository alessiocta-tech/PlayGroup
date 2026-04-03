const WHAPI_TOKEN = process.env.WHAPI_TOKEN
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL ?? 'https://gate.whapi.cloud'

export async function sendWhapiMessage(to: string, text: string): Promise<void> {
  if (!WHAPI_TOKEN) {
    console.warn('[Whapi] Missing token, skipping message')
    return
  }

  const res = await fetch(`${WHAPI_BASE_URL}/messages/text`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, body: text }),
  })

  if (!res.ok) {
    console.error('[Whapi] Send error:', await res.text())
  }
}

export async function markWhapiRead(messageId: string): Promise<void> {
  if (!WHAPI_TOKEN) return

  await fetch(`${WHAPI_BASE_URL}/messages/${messageId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${WHAPI_TOKEN}` },
  })
}
