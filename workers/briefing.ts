import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { anthropic, buildDashboardContext } from '@/lib/claude'
import { sendTelegram } from '@/lib/telegram'

export function startBriefingWorker() {
  const worker = new Worker(
    'morning-briefing',
    async (job: Job) => {
      console.log('[Briefing] Starting morning briefing job:', job.id)

      const context = await buildDashboardContext()

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${context}

Genera un briefing mattutino conciso per Alessio. Formato:
🌅 <b>Buongiorno Alessio!</b>

💰 <b>Incassi di ieri</b>
[dati]

📅 <b>Agenda oggi</b>
[prossimi eventi]

✅ <b>Task prioritari</b>
[task urgenti e high]

⚠️ <b>Da gestire</b>
[notifiche importanti, escalation, bug critici]

Sii conciso, diretto, in italiano. Massimo 200 parole.`,
          },
        ],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      await sendTelegram(text)
      console.log('[Briefing] Sent morning briefing')
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[Briefing] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[Briefing] Job ${job?.id} failed:`, err))

  return worker
}
