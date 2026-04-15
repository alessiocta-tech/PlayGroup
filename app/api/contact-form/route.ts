import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendTelegram } from '@/lib/telegram'

const contactSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().max(200),
  oggetto: z.string().min(2).max(200),
  messaggio: z.string().min(10).max(2000),
})

const candidaturaSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().max(200),
  posizione: z.string().max(200).optional(),
  messaggio: z.string().min(10).max(2000),
  tipo: z.literal('candidatura'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>

    if (body.tipo === 'candidatura') {
      const parsed = candidaturaSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 })
      }
      const { nome, email, posizione, messaggio } = parsed.data
      await sendTelegram(
        `👤 <b>Nuova candidatura</b>\n` +
        `Nome: <b>${nome}</b>\n` +
        `Email: ${email}\n` +
        `Ruolo: ${posizione ?? 'non specificato'}\n\n` +
        `${messaggio.slice(0, 500)}${messaggio.length > 500 ? '…' : ''}`
      )
      return NextResponse.json({ success: true })
    }

    // Form contatti generico
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 })
    }
    const { nome, email, oggetto, messaggio } = parsed.data
    await sendTelegram(
      `📬 <b>Nuovo messaggio dal sito</b>\n` +
      `Da: <b>${nome}</b> &lt;${email}&gt;\n` +
      `Oggetto: ${oggetto}\n\n` +
      `${messaggio.slice(0, 500)}${messaggio.length > 500 ? '…' : ''}`
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ContactForm] Error:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
