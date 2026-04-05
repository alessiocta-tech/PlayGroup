import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegram } from '@/lib/telegram'

// Home Assistant webhook — HA calls this via automation with entity state changes
// Payload example: { entity_id: "light.salon", state: "on", attributes: { ... } }

interface HaWebhookPayload {
  entity_id: string
  friendly_name?: string
  state: string
  device_class?: string
  room?: string
  value?: string
  alert?: boolean
  alert_message?: string
}

function normalizeStatus(state: string): string {
  const s = state.toLowerCase()
  if (s === 'on' || s === 'home' || s === 'open') return 'on'
  if (s === 'off' || s === 'away' || s === 'closed') return 'off'
  if (s === 'unavailable' || s === 'unknown') return 'unknown'
  return s
}

export async function POST(req: NextRequest) {
  try {
    // Optional: verify shared secret from HA
    const secret = req.headers.get('x-ha-secret')
    if (process.env.HA_WEBHOOK_SECRET && secret !== process.env.HA_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as HaWebhookPayload

    const {
      entity_id,
      friendly_name,
      state,
      device_class,
      room,
      value,
      alert = false,
      alert_message,
    } = payload

    const status = normalizeStatus(state)
    const name = friendly_name ?? entity_id
    const type = device_class ?? entity_id.split('.')[0]

    // Upsert device
    let device = await prisma.homeDevice.findFirst({
      where: { meta: { path: ['entity_id'], equals: entity_id } },
    })

    if (device) {
      device = await prisma.homeDevice.update({
        where: { id: device.id },
        data: { status, lastSeen: new Date() },
      })
    } else {
      device = await prisma.homeDevice.create({
        data: {
          name,
          type,
          room: room ?? null,
          status,
          lastSeen: new Date(),
          meta: { entity_id },
        },
      })
    }

    // Log event
    await prisma.homeEvent.create({
      data: {
        deviceId: device.id,
        eventType: `state_changed`,
        value: value ?? state,
      },
    })

    // Critical alerts → Telegram + Notification
    if (alert) {
      const msg = alert_message ?? `⚠️ Home Assistant: ${name} → ${state}`
      await Promise.all([
        sendTelegram(`🏠 <b>Domotica Alert</b>\n${msg}`),
        prisma.notification.create({
          data: {
            type: 'home_alert',
            title: `Domotica: ${name}`,
            body: msg,
            priority: 'high',
          },
        }),
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Home webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// HA sometimes does a GET to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Play Group Home Assistant' })
}
