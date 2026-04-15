import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { anthropic } from '@/lib/claude'

const MessageSchema = z.object({
  id: z.string(),
  contactName: z.string(),
  message: z.string(),
  timestamp: z.string(),
  handledByAi: z.boolean(),
  escalated: z.boolean(),
})

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
})

interface SuggestedTask {
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  contact: string
  source: string
}

interface AnalysisResult {
  tasks: SuggestedTask[]
  summary: string
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Dati non validi', detail: err }, { status: 400 })
  }

  const { messages } = body

  const messagesText = messages
    .map(
      (m) =>
        `[${new Date(m.timestamp).toLocaleString('it-IT')}] Da: ${m.contactName}\n"${m.message}"${m.escalated ? ' [ESCALATION]' : ''}${m.handledByAi ? ' [GESTITO DA AI]' : ''}`
    )
    .join('\n\n')

  const prompt = `Sei l'assistente personale di Alessio Muzzarelli. Analizza i seguenti messaggi WhatsApp ricevuti e identifica i task concreti e urgenti da fare.

MESSAGGI:
${messagesText}

Rispondi SOLO con un JSON valido nel seguente formato (nessun testo aggiuntivo):
{
  "summary": "Breve sintesi in 1-2 frasi di cosa emerge dai messaggi",
  "tasks": [
    {
      "priority": "urgent|high|medium|low",
      "title": "Titolo breve del task (max 60 caratteri)",
      "description": "Cosa fare esattamente, in modo pratico",
      "contact": "Nome del contatto da cui viene il task",
      "source": "Citazione breve del messaggio originale (max 80 caratteri)"
    }
  ]
}

Regole:
- Includi SOLO task concreti e azionabili (rispondere, richiamare, confermare, inviare info, ecc.)
- Non duplicare task simili dello stesso contatto
- Ignora messaggi già gestiti dall'AI (handledByAi=true) e non escalation se non richiedono azione
- Massimo 8 task
- Se non ci sono task urgenti, restituisci tasks: []`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let parsed: AnalysisResult
    try {
      parsed = JSON.parse(jsonStr) as AnalysisResult
    } catch {
      return NextResponse.json<AnalysisResult>({
        summary: 'Analisi completata',
        tasks: [],
      })
    }

    // Validate structure loosely
    const tasks: SuggestedTask[] = (parsed.tasks ?? [])
      .filter(
        (t): t is SuggestedTask =>
          typeof t === 'object' &&
          t !== null &&
          typeof t.title === 'string' &&
          typeof t.priority === 'string'
      )
      .slice(0, 8)

    return NextResponse.json<AnalysisResult>({
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      tasks,
    })
  } catch (err) {
    console.error('[WhatsApp Analyse] Error:', err)
    return NextResponse.json({ error: 'Errore durante l\'analisi AI' }, { status: 500 })
  }
}
