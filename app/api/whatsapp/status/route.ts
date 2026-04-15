import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const WHAPI_TOKEN = process.env.WHAPI_TOKEN
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL ?? 'https://gate.whapi.cloud'

export interface WhapiChannelStatus {
  status: 'active' | 'unpaired' | 'loading' | 'blocked' | 'unknown'
  qr?: string           // base64 image when unpaired
  phone?: string        // phone number when active
  name?: string         // display name when active
  battery?: number
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!WHAPI_TOKEN) {
    return NextResponse.json<WhapiChannelStatus>({ status: 'unknown' })
  }

  try {
    const res = await fetch(`${WHAPI_BASE_URL}/channel`, {
      headers: { Authorization: `Bearer ${WHAPI_TOKEN}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json<WhapiChannelStatus>({ status: 'unknown' })
    }

    const data = await res.json()

    // Whapi returns: { status, qr, me: { name, phone }, battery }
    const status: WhapiChannelStatus['status'] =
      data.status === 'active'
        ? 'active'
        : data.status === 'unpaired' || data.qr
        ? 'unpaired'
        : data.status === 'loading'
        ? 'loading'
        : data.status === 'blocked'
        ? 'blocked'
        : 'unknown'

    return NextResponse.json<WhapiChannelStatus>({
      status,
      qr: data.qr ?? undefined,
      phone: data.me?.phone ?? data.phone ?? undefined,
      name: data.me?.name ?? data.name ?? undefined,
      battery: data.battery?.value ?? undefined,
    })
  } catch (err) {
    console.error('[Whapi] Status error:', err)
    return NextResponse.json<WhapiChannelStatus>({ status: 'unknown' })
  }
}
