import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── UTENTE ADMIN ────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'alessio@playgroupsrl.it' },
    update: {},
    create: {
      email: 'alessio@playgroupsrl.it',
      passwordHash,
      name: 'Alessio Muzzarelli',
      totpEnabled: false,
    },
  })
  console.log('✅ Utente admin creato:', user.email)

  // ─── AZIENDE ─────────────────────────────────────────────────────────────
  const derione = await prisma.company.upsert({
    where: { slug: 'derione' },
    update: {},
    create: {
      name: 'deRione',
      slug: 'derione',
      type: 'restaurant',
      color: '#E63946',
      config: {
        locations: ['Appia', 'Corso Trieste', 'Palermo', 'Reggio Calabria', 'Talenti'],
        integrations: { mysql_sync: true, whatsapp: true, fattura24: true },
      },
    },
  })

  const playViaggi = await prisma.company.upsert({
    where: { slug: 'play-viaggi' },
    update: {},
    create: {
      name: 'Play Viaggi / CTA Tuscolana',
      slug: 'play-viaggi',
      type: 'travel',
      color: '#2A9D8F',
      config: {
        piva: '12802221007',
        website: 'ctatuscolana.it',
        integrations: { whatsapp: true, fattura24: true },
      },
    },
  })

  const caseVacanze = await prisma.company.upsert({
    where: { slug: 'case-vacanze' },
    update: {},
    create: {
      name: 'Case Vacanze',
      slug: 'case-vacanze',
      type: 'hospitality',
      color: '#457B9D',
      config: {
        website: 'villaggi.playviaggi.com',
        integrations: { whatsapp: true },
      },
    },
  })

  const palermoFt = await prisma.company.upsert({
    where: { slug: 'palermo-ft' },
    update: {},
    create: {
      name: 'PALERMO FT S.R.L.S.',
      slug: 'palermo-ft',
      type: 'hospitality',
      color: '#F4A261',
      config: {
        piva: '18203101003',
        au: 'Anna Loredana Asciutto',
        mcc: true,
        integrations: {},
      },
    },
  })
  console.log('✅ 4 aziende create')

  // ─── KPI ULTIMI 30 GIORNI ────────────────────────────────────────────────
  const today = new Date()
  const kpiData = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // deRione — 5 ristoranti, buoni incassi
    kpiData.push({
      companyId: derione.id,
      date: new Date(dateStr),
      revenue: (2800 + Math.random() * 1200).toFixed(2),
      bookings: Math.floor(40 + Math.random() * 30),
      covers: Math.floor(120 + Math.random() * 80),
    })

    // Play Viaggi — stagionale
    kpiData.push({
      companyId: playViaggi.id,
      date: new Date(dateStr),
      revenue: (800 + Math.random() * 600).toFixed(2),
      bookings: Math.floor(5 + Math.random() * 10),
      covers: 0,
    })

    // Case Vacanze
    kpiData.push({
      companyId: caseVacanze.id,
      date: new Date(dateStr),
      revenue: (400 + Math.random() * 300).toFixed(2),
      bookings: Math.floor(2 + Math.random() * 5),
      covers: 0,
    })

    // PALERMO FT — in avvio, incassi bassi
    kpiData.push({
      companyId: palermoFt.id,
      date: new Date(dateStr),
      revenue: (0).toFixed(2),
      bookings: 0,
      covers: 0,
    })
  }

  for (const kpi of kpiData) {
    await prisma.dailyKpi.upsert({
      where: { companyId_date: { companyId: kpi.companyId, date: kpi.date } },
      update: {},
      create: kpi as any,
    })
  }
  console.log('✅ KPI 30 giorni creati')

  // ─── AGENTI AI ───────────────────────────────────────────────────────────
  const agents = [
    {
      companyId: derione.id,
      name: 'WhatsApp Agent deRione',
      type: 'whatsapp',
      status: 'active',
      currentTask: 'Gestione prenotazioni tavoli',
      totalHandled: 1240,
      resolvedCount: 1116,
    },
    {
      companyId: playViaggi.id,
      name: 'WhatsApp Agent Play Viaggi',
      type: 'whatsapp',
      status: 'active',
      currentTask: 'Risposta info tour Sicilia',
      totalHandled: 340,
      resolvedCount: 289,
    },
    {
      companyId: null,
      name: 'Social AI CTA',
      type: 'social',
      status: 'idle',
      currentTask: null,
      totalHandled: 89,
      resolvedCount: 89,
    },
    {
      companyId: null,
      name: 'Contabilità AI',
      type: 'accounting',
      status: 'idle',
      currentTask: null,
      totalHandled: 456,
      resolvedCount: 440,
    },
    {
      companyId: derione.id,
      name: 'Voice Agent Fidy',
      type: 'voice',
      status: 'error',
      currentTask: 'Errore connessione Fidy API',
      totalHandled: 678,
      resolvedCount: 601,
    },
  ]

  for (const agent of agents) {
    await prisma.agent.create({ data: agent as any })
  }
  console.log('✅ 5 agenti AI creati')

  // ─── CLAUDE CODE INSTANCES ───────────────────────────────────────────────
  await prisma.ccInstance.createMany({
    data: [
      {
        projectName: 'Play Group Dashboard',
        companyId: null,
        repoUrl: 'github.com/alessiomuzz/play-group',
        currentFile: 'prisma/seed.ts',
        currentTask: 'Fase 1b — Foundation setup',
        progress: 15,
        lastCommit: 'Initial project structure',
      },
      {
        projectName: 'deRione Gestionale',
        companyId: derione.id,
        repoUrl: 'github.com/alessiomuzz/derione',
        currentFile: 'app/bookings/api.php',
        currentTask: 'Fix bug prenotazioni duplicate',
        progress: 60,
        lastCommit: 'Add booking validation',
      },
    ],
  })
  console.log('✅ Claude Code instances create')

  // ─── BUG TRACKER ─────────────────────────────────────────────────────────
  await prisma.bug.createMany({
    data: [
      {
        companyId: derione.id,
        title: 'Prenotazioni duplicate in orario peak',
        description: 'Quando arrivano 2 prenotazioni nello stesso secondo, il sistema crea duplicati',
        project: 'deRione Gestionale',
        severity: 'high',
        status: 'in_progress',
      },
      {
        companyId: playViaggi.id,
        title: 'PDF preventivo tour non genera correttamente',
        description: 'Il PDF viene generato con encoding errato per caratteri accentati',
        project: 'Play Viaggi Django',
        severity: 'medium',
        status: 'open',
      },
      {
        companyId: null,
        title: 'Dashboard KPI non si aggiorna in realtime',
        description: 'Il polling ogni 30s non funziona dopo deploy Railway',
        project: 'Play Group Dashboard',
        severity: 'low',
        status: 'open',
      },
    ],
  })
  console.log('✅ Bug tracker popolato')

  // ─── MESSAGGI WHATSAPP ───────────────────────────────────────────────────
  const waMessages = [
    {
      companyId: derione.id,
      contactName: 'Marco Rossi',
      contactPhone: '+393331234567',
      message: 'Buonasera, vorrei prenotare un tavolo per 4 persone sabato sera',
      direction: 'inbound',
      handledByAi: true,
      escalated: false,
      aiResponse: 'Buonasera Marco! Certo, ho disponibilità sabato sera. A che ora preferisce? Tenga presente che serviamo dalle 19:30.',
    },
    {
      companyId: derione.id,
      contactName: 'Laura Bianchi',
      contactPhone: '+393389876543',
      message: 'Ho trovato un capello nel piatto, sono molto delusa dal servizio',
      direction: 'inbound',
      handledByAi: false,
      escalated: true,
      aiResponse: null,
    },
    {
      companyId: playViaggi.id,
      contactName: 'Giuseppe Ferrari',
      contactPhone: '+393201111222',
      message: 'Quanto costa il tour in Sicilia per 2 persone a luglio?',
      direction: 'inbound',
      handledByAi: true,
      escalated: false,
      aiResponse: 'Buongiorno Giuseppe! Il tour Sicilia 7 giorni per 2 persone a luglio è disponibile a partire da €980 a persona, tutto incluso. Vuole che le mandi il programma dettagliato?',
    },
  ]

  for (const msg of waMessages) {
    await prisma.waMessage.create({ data: msg as any })
  }
  console.log('✅ Messaggi WhatsApp creati')

  // ─── CRM CONTATTI VIP ────────────────────────────────────────────────────
  const contacts = [
    {
      name: 'Anna Loredana Asciutto',
      company: 'PALERMO FT S.R.L.S.',
      role: 'Amministratore Unico',
      phone: '+39333000001',
      email: 'anna.asciutto@palermoFT.it',
      type: 'socio',
      notes: 'A.U. di PALERMO FT. Segue operativamente il progetto hospitality a Palermo. Aggiornamento MCC previsto fine mese.',
      tags: ['palermo-ft', 'socio', 'au'],
    },
    {
      name: 'Macaluso Ruben',
      company: 'Play Group S.R.L.',
      role: 'Socio',
      phone: '+39333000002',
      email: 'ruben.macaluso@playgroup.it',
      type: 'socio',
      notes: 'Socio storico. Referente per relazioni commerciali Nord Italia.',
      tags: ['socio', 'nord-italia'],
    },
    {
      name: 'Mario Conti',
      company: 'Banca MCC Roma',
      role: 'Responsabile Finanziamenti',
      phone: '+39065551234',
      email: 'm.conti@mcc.it',
      type: 'partner',
      notes: 'Referente per pratica finanziamento PALERMO FT. Ultima chiamata: richiesta documenti aggiuntivi.',
      nextAction: 'Inviare business plan aggiornato',
      tags: ['mcc', 'finanziamento', 'palermo-ft'],
    },
  ]

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact as any })
  }
  console.log('✅ Contatti VIP creati')

  // ─── EVENTI CALENDARIO ───────────────────────────────────────────────────
  const now = new Date()
  await prisma.event.createMany({
    data: [
      {
        title: 'Call con MCC per PALERMO FT',
        description: 'Revisione pratica finanziamento. Portare business plan aggiornato.',
        startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        type: 'business',
        companyId: palermoFt.id,
      },
      {
        title: 'Riunione staff deRione Appia',
        description: 'Briefing mensile con i responsabili di sala.',
        startAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        type: 'business',
        companyId: derione.id,
      },
      {
        title: 'Scadenza IVA trimestrale',
        description: 'Versamento IVA Q1. Preparare F24.',
        startAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        type: 'deadline',
        allDay: true,
      },
      {
        title: 'Allenamento palestra',
        startAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000),
        type: 'personal',
        location: 'Gym Roma Appia',
      },
    ],
  })
  console.log('✅ Eventi calendario creati')

  // ─── TASK ────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      {
        companyId: palermoFt.id,
        title: 'Completare business plan PALERMO FT',
        description: 'Aggiornare proiezioni finanziarie e piano operativo per MCC',
        priority: 'urgent',
        status: 'in_progress',
        tags: ['mcc', 'urgente'],
      },
      {
        companyId: derione.id,
        title: 'Rinnovare contratti fornitori deRione',
        description: 'Scadenza contratti con fornitori principali (bevande, pane)',
        priority: 'high',
        status: 'open',
        tags: ['contratti', 'fornitori'],
      },
      {
        companyId: null,
        title: 'Setup Google Analytics su playgroupsrl.it',
        priority: 'low',
        status: 'open',
        tags: ['sito', 'analytics'],
      },
    ],
  })
  console.log('✅ Task creati')

  // ─── CONTABILITÀ ─────────────────────────────────────────────────────────
  await prisma.personalFinance.createMany({
    data: [
      {
        date: new Date(today.getFullYear(), today.getMonth(), 1),
        amount: 8500,
        category: 'Stipendio / Utile Play Group',
        type: 'income',
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), 5),
        amount: 1200,
        category: 'Affitto ufficio Roma',
        type: 'expense',
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), 10),
        amount: 350,
        category: 'Assicurazioni',
        type: 'expense',
      },
      {
        date: new Date(today.getFullYear(), today.getMonth(), 15),
        amount: 2400,
        category: 'Utile deRione Q1',
        type: 'income',
      },
    ],
  })

  await prisma.taxDeadline.createMany({
    data: [
      {
        title: 'IVA Trimestrale Q1',
        description: 'Versamento IVA primo trimestre tutte le aziende',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
        amount: 3200,
        status: 'pending',
      },
      {
        title: 'F24 INPS Artigiani',
        description: 'Contributi INPS trimestrale',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
        amount: 890,
        status: 'pending',
      },
    ],
  })
  console.log('✅ Contabilità e scadenze fiscali create')

  // ─── SALUTE ──────────────────────────────────────────────────────────────
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    await prisma.healthMetric.upsert({
      where: { date: new Date(date.toISOString().split('T')[0]) },
      update: {},
      create: {
        date: new Date(date.toISOString().split('T')[0]),
        weight: parseFloat((82 + (Math.random() * 2 - 1)).toFixed(1)),
        steps: Math.floor(7000 + Math.random() * 5000),
        sleepHours: parseFloat((6.5 + Math.random() * 2).toFixed(1)),
        heartRate: Math.floor(58 + Math.random() * 15),
        hrv: Math.floor(45 + Math.random() * 20),
        calories: Math.floor(1800 + Math.random() * 600),
      },
    })
  }
  console.log('✅ Metriche salute create')

  // ─── DOMOTICA ────────────────────────────────────────────────────────────
  const devices = [
    { name: 'Termostato Soggiorno', type: 'thermostat', room: 'Soggiorno', status: 'on', meta: { temperature: 21.5, target: 22 } },
    { name: 'Luci Cucina', type: 'light', room: 'Cucina', status: 'off', meta: { brightness: 0 } },
    { name: 'Luci Soggiorno', type: 'light', room: 'Soggiorno', status: 'on', meta: { brightness: 80 } },
    { name: 'Allarme Casa', type: 'alarm', room: 'Generale', status: 'armed', meta: { zones: 4 } },
    { name: 'Presa Smart Studio', type: 'plug', room: 'Studio', status: 'on', meta: { power_w: 45 } },
  ]

  for (const device of devices) {
    await prisma.homeDevice.create({ data: { ...device, meta: device.meta, lastSeen: new Date() } })
  }
  console.log('✅ Dispositivi domotica creati')

  // ─── NOTIFICHE ───────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        type: 'whatsapp_escalation',
        title: 'Escalation WhatsApp — deRione',
        body: 'Laura Bianchi: reclamo ricevuto, richiede attenzione immediata',
        priority: 'critical',
        read: false,
      },
      {
        type: 'tax_deadline',
        title: 'Scadenza fiscale tra 15 giorni',
        body: 'IVA Trimestrale Q1 — €3.200 da versare',
        priority: 'high',
        read: false,
      },
      {
        type: 'agent_error',
        title: 'Voice Agent Fidy in errore',
        body: 'Impossibile connettersi alle API Fidy da 2 ore',
        priority: 'high',
        read: false,
      },
    ],
  })
  console.log('✅ Notifiche create')

  console.log('\n🎉 Seed completato con successo!')
  console.log('📧 Login: alessio@playgroupsrl.it')
  console.log('🔑 Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Errore seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
