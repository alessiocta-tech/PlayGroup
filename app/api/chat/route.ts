import { auth } from '@/lib/auth'
import { anthropic, buildDashboardContext } from '@/lib/claude'
import { rateLimit } from '@/lib/rate-limit'
import { sendTelegram } from '@/lib/telegram'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

// ── Tool definitions ──────────────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: 'create_task',
    description: 'Crea un nuovo task nel sistema. Usa quando Alessio chiede di aggiungere un task, un promemoria o un\'attività da fare.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titolo del task' },
        description: { type: 'string', description: 'Descrizione opzionale del task' },
        priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'], description: 'Priorità del task' },
        dueDate: { type: 'string', description: 'Data scadenza in formato YYYY-MM-DD (opzionale)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'send_telegram',
    description: 'Invia un messaggio Telegram ad Alessio. Usa per notifiche importanti, promemoria urgenti o comunicazioni che devono arrivare subito.',
    input_schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Testo del messaggio da inviare via Telegram' },
      },
      required: ['message'],
    },
  },
  {
    name: 'update_agent_status',
    description: 'Aggiorna lo stato di un agente AI (es. metti in pausa, riattiva). Usa quando Alessio chiede di fermare o riavviare un agente.',
    input_schema: {
      type: 'object',
      properties: {
        agentName: { type: 'string', description: 'Nome dell\'agente da aggiornare' },
        status: { type: 'string', enum: ['active', 'idle', 'paused', 'error'], description: 'Nuovo stato dell\'agente' },
      },
      required: ['agentName', 'status'],
    },
  },
  {
    name: 'create_notification',
    description: 'Crea una notifica nel sistema dashboard. Usa per segnalare qualcosa di importante che Alessio deve vedere.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titolo della notifica' },
        body: { type: 'string', description: 'Corpo del messaggio' },
        priority: { type: 'string', enum: ['critical', 'high', 'normal', 'low'], description: 'Priorità della notifica' },
      },
      required: ['title'],
    },
  },
]

// ── Tool executors ────────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'create_task': {
        const task = await prisma.task.create({
          data: {
            title: input.title as string,
            description: (input.description as string) ?? null,
            priority: (input.priority as string) ?? 'medium',
            dueDate: input.dueDate ? new Date(input.dueDate as string) : null,
            status: 'open',
          },
        })
        return `✅ Task creato: "${task.title}" (ID: ${task.id})`
      }

      case 'send_telegram': {
        await sendTelegram(input.message as string)
        return `✅ Messaggio Telegram inviato`
      }

      case 'update_agent_status': {
        const agent = await prisma.agent.findFirst({
          where: { name: { contains: input.agentName as string, mode: 'insensitive' } },
        })
        if (!agent) return `❌ Agente "${input.agentName}" non trovato`
        await prisma.agent.update({
          where: { id: agent.id },
          data: { status: input.status as string },
        })
        return `✅ Agente "${agent.name}" → stato aggiornato a "${input.status}"`
      }

      case 'create_notification': {
        await prisma.notification.create({
          data: {
            type: 'ai_created',
            title: input.title as string,
            body: (input.body as string) ?? null,
            priority: (input.priority as string) ?? 'normal',
          },
        })
        return `✅ Notifica creata: "${input.title}"`
      }

      default:
        return `❌ Tool sconosciuto: ${name}`
    }
  } catch (err) {
    return `❌ Errore eseguendo ${name}: ${String(err)}`
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'chat')
  if (limited) return limited

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

Puoi eseguire azioni reali usando i tool disponibili:
- create_task: per creare task o promemoria
- send_telegram: per inviare messaggi urgenti ad Alessio
- update_agent_status: per gestire gli agenti AI
- create_notification: per segnalare cose importanti nella dashboard

Quando usi un tool, conferma sempre l'azione eseguita con un breve messaggio.

${context}`

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        // Agentic loop: continua finché non ci sono più tool calls
        const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

        while (true) {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: systemPrompt,
            tools,
            messages: apiMessages,
            stream: false,
          })

          // Stream testo al client
          for (const block of response.content) {
            if (block.type === 'text') {
              // Simula streaming char-by-char per UX fluida
              send({ text: block.text })
            }
          }

          // Nessun tool call → fine
          if (response.stop_reason !== 'tool_use') break

          // Raccogli tool calls
          const toolUseBlocks = response.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
          )
          if (toolUseBlocks.length === 0) break

          // Esegui tools in parallelo
          const toolResults = await Promise.all(
            toolUseBlocks.map(async (toolUse) => {
              send({ tool: toolUse.name, status: 'running' })
              const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>)
              send({ tool: toolUse.name, status: 'done', result })
              return {
                type: 'tool_result' as const,
                tool_use_id: toolUse.id,
                content: result,
              }
            })
          )

          // Aggiungi risposta assistant + risultati tools alla conversazione
          apiMessages.push({ role: 'assistant', content: response.content })
          apiMessages.push({ role: 'user', content: toolResults })
        }
      } catch (err) {
        send({ error: String(err) })
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
