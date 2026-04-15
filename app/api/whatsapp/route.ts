import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/claude'
import { sendWhapiMessage } from '@/lib/whapi'
import { sendTelegram } from '@/lib/telegram'
import { rateLimit } from '@/lib/rate-limit'

// Whapi webhook payload types
interface WhapiContact {
  id: string
  name?: string
}

interface WhapiMessage {
  id: string
  type: string
  from: string
  from_me: boolean
  body?: string
  text?: { body: string }
  timestamp: number
  chat_id: string
  _data?: { notifyName?: string }
}

interface WhapiWebhookPayload {
  messages?: WhapiMessage[]
  contacts?: WhapiContact[]
}

const SYSTEM_PROMPT = `Sei l'assistente AI di Alessio Muzzarelli per le comunicazioni WhatsApp delle sue aziende.
Rispondi in italiano, tono professionale e cordiale. Sii conciso (max 3 frasi).

GESTISCI AUTONOMAMENTE:
- Info ristoranti deRione (orari 12:00-15:00 e 19:00-23:00, cucina italiana tradizionale, 5 sedi: Roma Appia, Corso Trieste, Palermo, Reggio Calabria, Talenti)
- Prenotazioni tavoli (raccogli: nome, data, ora, numero coperti, telefono)
- Info tour Play Viaggi / CTA Tuscolana (agenzia viaggi di gruppo, tour organizzati)
- Info case vacanze (ville e appartamenti per vacanze)
- Saluti, ringraziamenti, info generiche

ESCALA (rispondi SOLO con "ESCALA: [motivo breve]"):
- Reclami e lamentele
- Importi superiori a €500
- Richieste di sconti o trattative
- Situazioni ambigue o tono aggressivo
- Richieste legali o burocratiche
- Richiesta esplicita di parlare con Alessio
- Se sei incerto al 50% o più

Non rivelare di essere un AI a meno che non venga chiesto direttamente.`

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'whatsapp')
  if (limited) return limited

  try {
    const payload = await req.json() as WhapiWebhookPayload
    const messages = payload.messages ?? []

    for (const msg of messages) {
      // Skip outbound messages
      if (msg.from_me) continue

      // Extract message text
      const text = msg.text?.body ?? msg.body ?? ''
      if (!text.trim()) continue

      const phone = msg.from.replace('@s.whatsapp.net', '').replace('@c.us', '')
      const contactName = msg._data?.notifyName ?? null

      // Save inbound message to DB
      const savedMsg = await prisma.waMessage.create({
        data: {
          contactPhone: phone,
          contactName,
          message: text,
          direction: 'inbound',
          handledByAi: false,
          escalated: false,
          timestamp: new Date(msg.timestamp * 1000),
        },
      })

      // Call Claude
      const aiResponse = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      })

      const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ''
      // Match "ESCALA" o "ESCALA:" all'inizio del testo, case-insensitive, con spazi opzionali
      const shouldEscalate = /^ESCALA\s*:/i.test(aiText.trim())

      if (shouldEscalate) {
        // Mark as escalated
        await prisma.waMessage.update({
          where: { id: savedMsg.id },
          data: { escalated: true, handledByAi: false },
        })

        // Create notification
        await prisma.notification.create({
          data: {
            type: 'whatsapp_escalation',
            title: `Escalation WhatsApp — ${contactName ?? phone}`,
            body: `${text.slice(0, 100)}${text.length > 100 ? '…' : ''}`,
            priority: 'high',
          },
        })

        // Alert Telegram
        const reason = aiText.replace(/^ESCALA:\s*/i, '')
        await sendTelegram(
          `📲 <b>Escalation WhatsApp</b>\n` +
          `Da: <b>${contactName ?? phone}</b> (${phone})\n` +
          `Motivo: ${reason}\n\n` +
          `Messaggio: "${text.slice(0, 200)}"`
        )

        // Send holding reply to user
        await sendWhapiMessage(
          msg.from,
          'Grazie per il messaggio! Un nostro operatore ti contatterà al più presto. 🙏'
        )
      } else {
        // AI handles it
        await prisma.waMessage.update({
          where: { id: savedMsg.id },
          data: { handledByAi: true, aiResponse: aiText },
        })

        // Save outbound message
        await prisma.waMessage.create({
          data: {
            contactPhone: phone,
            contactName,
            message: aiText,
            direction: 'outbound',
            handledByAi: true,
            timestamp: new Date(),
          },
        })

        // Send reply
        await sendWhapiMessage(msg.from, aiText)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WhatsApp webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Whapi sends GET to verify webhook
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Play Group WhatsApp' })
}
