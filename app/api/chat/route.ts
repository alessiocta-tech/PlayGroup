import { auth } from '@/lib/auth'
import { anthropic, buildDashboardContext } from '@/lib/claude'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json() as { messages: Array<{ role: string; content: string }> }
  const { messages } = body

  if (!messages || !Array.isArray(messages)) {
    return new Response('Invalid request', { status: 400 })
  }

  const context = await buildDashboardContext()

  const systemPrompt = `Sei l'assistente AI personale di Alessio Muzzarelli, CEO di Play Group S.R.L.
Hai accesso in tempo reale a tutti i dati del sistema: incassi, agenti AI, calendario, task, contabilità, salute, casa.
Rispondi sempre in italiano, in modo conciso e diretto.
Puoi rispondere a domande sui dati, creare analisi, suggerire azioni.

${context}`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const data = `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
          controller.enqueue(encoder.encode(data))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
