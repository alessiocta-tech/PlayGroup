import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { prisma } from '@/lib/prisma'
import { sendTelegram } from '@/lib/telegram'

export function startAlertsWorker() {
  const worker = new Worker(
    'alerts',
    async (job: Job) => {
      console.log('[Alerts] Checking alerts:', job.id)

      const now = new Date()
      const in7Days = new Date(now)
      in7Days.setDate(in7Days.getDate() + 7)

      // Tax deadlines coming up in the next 7 days
      const upcomingTax = await prisma.taxDeadline.findMany({
        where: {
          status: 'pending',
          dueDate: { gte: now, lte: in7Days },
        },
      })

      for (const tax of upcomingTax) {
        const daysLeft = Math.ceil(
          (new Date(tax.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        const msg = [
          `⚠️ <b>Scadenza fiscale tra ${daysLeft} giorni</b>`,
          tax.title,
          tax.amount ? `€${tax.amount.toNumber().toLocaleString('it-IT')}` : null,
          `Scadenza: ${new Date(tax.dueDate).toLocaleDateString('it-IT')}`,
        ]
          .filter(Boolean)
          .join('\n')

        await prisma.notification.create({
          data: {
            type: 'tax_deadline',
            title: `Scadenza fiscale tra ${daysLeft} giorni`,
            body: tax.title,
            priority: daysLeft <= 2 ? 'critical' : 'high',
          },
        })

        if (daysLeft <= 3) {
          await sendTelegram(msg)
        }
      }

      // Mark overdue deadlines as late and alert immediately
      const lateTax = await prisma.taxDeadline.findMany({
        where: { status: 'pending', dueDate: { lt: now } },
      })

      for (const tax of lateTax) {
        await prisma.taxDeadline.update({
          where: { id: tax.id },
          data: { status: 'late' },
        })
        await sendTelegram(
          `🚨 <b>SCADENZA FISCALE SUPERATA</b>\n${tax.title}\nEra in scadenza: ${new Date(tax.dueDate).toLocaleDateString('it-IT')}`
        )
      }

      console.log(
        `[Alerts] Checked: ${upcomingTax.length} upcoming, ${lateTax.length} late`
      )
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[Alerts] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[Alerts] Job ${job?.id} failed:`, err))

  return worker
}
