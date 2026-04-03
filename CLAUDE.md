# PLAY GROUP — Sistema Operativo Personale
## Brief completo per Claude Code

> **Lead developer**: Claude (Anthropic)
> **Stack**: Next.js 14 + Prisma + PostgreSQL + BullMQ + Railway
> **Dominio**: playgroupsrl.it (SiteGround DNS → Railway)
> **Admin URL**: playgroupsrl.it/admin (area riservata, solo Alessio)
> **Stato**: Fase 1a completata — in attesa conferma per Fase 1b

---

## CHI SONO

Alessio Muzzarelli, CEO di Play Group S.R.L., Roma.
Gestisco 4 aziende e una vita personale complessa.
Questo sistema centralizza tutto in un'unica piattaforma:
- **playgroupsrl.it** → sito pubblico aziendale (da costruire da zero)
- **playgroupsrl.it/admin** → sistema operativo personale privato

---

## AZIENDE

| Nome | Tipo | Stack esistente | Note |
|------|------|-----------------|------|
| deRione | restaurant | PHP/MySQL · rione.fidy.app | 5 location |
| Play Viaggi / CTA Tuscolana | travel | Django · ctatuscolana.it | P.IVA 12802221007 |
| Case Vacanze | hospitality | villaggi.playviaggi.com | |
| PALERMO FT S.R.L.S. | hospitality | — | In avvio · MCC in corso · A.U. Anna Loredana Asciutto · P.IVA 18203101003 |

Il sistema supporta aggiunta di nuove aziende senza modificare codice — solo INSERT in `companies`.

---

## STACK TECNICO (definitivo)

| Layer | Tecnologia | Note |
|---|---|---|
| **Full-stack** | Next.js 14 App Router | TypeScript strict, Server Components, streaming SSE nativo |
| **ORM** | Prisma | Type-safe, migrations, singleton client |
| **Validazione** | Zod | Su ogni API route e Server Action |
| **Database** | PostgreSQL 16 | Railway managed plugin |
| **Cache / Queue broker** | Redis 7 | Railway managed plugin |
| **Background jobs** | BullMQ + tsx | TypeScript-native, Bull Board incluso |
| **Auth** | NextAuth.js v5 | Credentials provider, JWT session |
| **Styling** | Tailwind CSS puro | Zero librerie UI esterne |
| **Charts** | Recharts | |
| **PWA** | @ducanh2912/next-pwa | Compatibile App Router — genera sw automaticamente |
| **Deploy** | Railway | Cloud 24/7, no Mac acceso, no timeout, WebSocket/SSE ok |

### Dipendenze chiave
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "next-auth": "^5.0.0",
    "@prisma/client": "^5.x",
    "bullmq": "^5.x",
    "ioredis": "^5.x",
    "zod": "^3.x",
    "recharts": "^2.x",
    "bcryptjs": "^2.4.3",
    "rate-limiter-flexible": "^5.x",
    "@ducanh2912/next-pwa": "^10.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "tsx": "^4.x",
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/bcryptjs": "^2.x"
  }
}
```
**Nota**: `@upstash/ratelimit` NON va usato — richiede Redis Upstash cloud separato.
Usare `rate-limiter-flexible` con `ioredis` (compatibile con Railway Redis).

**Nota Decimal**: `Prisma.Decimal` non è un JS `number` nativo. Ogni API route che restituisce
campi `Decimal` (revenue, amount) deve chiamare `.toNumber()` prima di serializzare in JSON.

### Servizi esterni
- **Claude API** (Anthropic) — agente AI + chat
- **Whapi.cloud** — WhatsApp business
- **Telegram Bot** — escalation e alert
- **Google Calendar API** — agenda
- **Gmail API** — email
- **Fattura24 API** — contabilità
- **Home Assistant** — domotica
- **n8n Cloud** — alessioiavirtual.app.n8n.cloud (già attivo, cloud, 24/7)

### Hosting e domini
- **SiteGround**: DNS manager per playgroupsrl.it (record A → IP Railway)
- **Railway**: unico deploy cloud 24/7 — tutto gira qui, indipendente dal Mac
  - Service `web`: Next.js app
  - Service `worker`: BullMQ worker (`tsx workers/index.ts`)
  - Plugin `postgresql`: PostgreSQL 16 managed con backup
  - Plugin `redis`: Redis 7 managed
- `playgroupsrl.it` → sito pubblico (nessuna auth)
- `playgroupsrl.it/admin` → area privata (NextAuth required)

---

## ARCHITETTURA — DUE ANIME IN UN CODEBASE

```
playgroupsrl.it/       → Sito pubblico Play Group S.R.L.
playgroupsrl.it/admin  → Sistema operativo privato Alessio
```

### Route groups Next.js App Router
```
app/
├── (public)/          → layout pubblico (navbar, footer) — nessuna auth
│                        URL prodotti: /, /chi-siamo, /aziende, /contatti, ecc.
└── admin/             → layout admin (sidebar, topbar) — auth required
    └── ...               URL prodotti: /admin, /admin/aziende, /admin/whatsapp, ecc.
```
⚠️ `(public)` usa le parentesi → il route group è trasparente nell'URL.
⚠️ `admin` NON usa parentesi → produce URL `/admin/*` correttamente.

### Protezione route
```typescript
// middleware.ts (root del progetto — non dentro /app)
// Blocca TUTTE le richieste a /admin/* se sessione non valida
export const config = { matcher: ['/admin/:path*'] }
```

### Multi-tenant
Ogni tabella ha `companyId`. Aggiungere un'azienda = 1 INSERT in `companies`.

```typescript
const COMPANY_MODULES = {
  restaurant:   ['kpi', 'bookings', 'shifts', 'whatsapp', 'pos_sync'],
  travel:       ['kpi', 'tours', 'bookings', 'whatsapp', 'catalog'],
  hospitality:  ['kpi', 'rooms', 'checkin', 'whatsapp', 'mcc_docs'],
  generic:      ['kpi', 'whatsapp', 'tasks', 'contacts'],
  personal:     ['finance', 'health', 'calendar', 'home', 'sport'],
}
```

---

## SICUREZZA AREA /admin

### Modalità DEV (ora — sviluppo rapido)
- NextAuth Credentials: email + password in chiaro nel `.env`
- Niente 2FA, niente rate limit
- Middleware protegge /admin ma con sessione semplice

### Modalità PROD (Fase 9 — prima del go-live)
Stack a 8 layer — dettaglio in fondo al documento.

---

## SITO PUBBLICO — playgroupsrl.it

| Route | Contenuto |
|---|---|
| `/` | Homepage: hero, presentazione gruppo, 4 aziende, CTA contatti |
| `/chi-siamo` | Storia Play Group, team, valori, Alessio Muzzarelli |
| `/aziende` | Overview 4 aziende |
| `/aziende/derione` | Ristoranti deRione: sedi, menu, prenotazioni |
| `/aziende/play-viaggi` | CTA Tuscolana: tour, destinazioni, contatti |
| `/aziende/case-vacanze` | Ville e appartamenti, link villaggi.playviaggi.com |
| `/aziende/palermo-ft` | Progetto hospitality in avvio |
| `/contatti` | Form contatto, mappa, email, WhatsApp |
| `/lavora-con-noi` | Posizioni aperte, candidatura spontanea |

**Design**: stesso design system della dashboard (DM Sans, #EFEFEA, #F0C040) ma versione "marketing" — più spazio, hero grandi, professional.

---

## I 14 MODULI DEL SISTEMA (area /admin)

### Modulo 1 — Aziende
KPI giornalieri/settimanali/mensili per ogni azienda. Incassi, prenotazioni, presenze. Sync automatico via BullMQ.

### Modulo 2 — Agenti AI
Pannello controllo: WhatsApp Agent, Social AI CTA, Booking Agent, Contabilità AI, Voice Agent Fidy.
Per ciascuno: stato live/idle/error, task corrente, tasso risoluzione, log, pausa/riavvio.

### Modulo 3 — Claude Code Controller
Monitor istanze Claude Code: file corrente, progress, ultimo output, link repo.

### Modulo 4 — Bug Tracker
Issue tracker kanban (Open / In Progress / Resolved) per tutti i progetti.

### Modulo 5 — WhatsApp Business
Log messaggi, % risolti autonomamente, escalation pendenti, chat diretta.

### Modulo 6 — Email
Gmail API: inbox aggregata, AI triage, draft risposta automatica.

### Modulo 7 — CRM Contatti VIP
Soci, partner, investitori. Note, timeline relazione, reminder follow-up.

### Modulo 8 — Calendario & Impegni
Sync Google Calendar. Vista giornaliera/settimanale. AI priorità mattina. Task con deadline.

### Modulo 9 — Contabilità
Personale + aziendale aggregata + scadenze fiscali (F24, IVA). Import Fattura24.

### Modulo 10 — Sport & Salute
Import Apple Health. Piano allenamenti, trend, obiettivi.

### Modulo 11 — Casa & Condominio
Spese condominiali, riunioni, manutenzioni, documenti.

### Modulo 12 — Domotica
Home Assistant: stato dispositivi, controllo diretto, log eventi.

### Modulo 13 — Agente Personale (Chat AI)
Chat sempre visibile con accesso a tutti i dati Prisma in realtime.
Risponde a: "Quanto ho incassato?", "Quali fatture scadono?", "Cosa ho in agenda?"
Può eseguire azioni: creare task, inviare Telegram, aggiornare stati.

### Modulo 14 — Morning Briefing
Ogni giorno ore 8:00 via BullMQ: incasso ieri + agenda + email + scadenze + meteo Roma → Claude genera → Telegram + dashboard.

---

## DESIGN SYSTEM

- **Font**: DM Sans (Google Fonts)
- **Background**: `#EFEFEA` (cream)
- **Accent**: `#F0C040` (giallo)
- **Card chiare**: `#FFFFFF`
- **Card dark**: `#111111`
- **Sidebar**: `#111111` con icone
- **Numeri**: font-weight 800, grandi
- **Layout**: griglia densa, mix card chiare/scure
- **Border radius**: 12–20px
- **Regola**: Tailwind puro, zero librerie UI esterne

---

## SCHEMA DATABASE (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH ───────────────────────────────────────────
// NextAuth v5 con Prisma adapter richiede questi modelli esatti

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  name          String?
  image         String?
  totpSecret    String?
  totpEnabled   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  lastLogin     DateTime?

  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  twoFaDone    Boolean  @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── AUDIT LOG ──────────────────────────────────────

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String   // LOGIN | LOGOUT | VIEW | CREATE | UPDATE | DELETE | FAILED_LOGIN
  resource   String
  resourceId String?
  ip         String
  userAgent  String?
  timestamp  DateTime @default(now())
  meta       Json     @default("{}")

  @@index([userId, timestamp(sort: Desc)])
  @@index([timestamp(sort: Desc)])
}

// ─── CORE MULTI-TENANT ──────────────────────────────

model Company {
  id         String   @id @default(uuid())
  name       String
  slug       String   @unique
  type       String   // restaurant | travel | hospitality | generic | personal
  color      String   @default("#F0C040")
  active     Boolean  @default(true)
  config     Json     @default("{}")
  createdAt  DateTime @default(now())

  kpi         DailyKpi[]
  agents      Agent[]
  ccInstances CcInstance[]
  bugs        Bug[]
  waMessages  WaMessage[]
  tasks       Task[]
  emails      Email[]
  events      Event[]
}

// ─── KPI ────────────────────────────────────────────

model DailyKpi {
  id        String   @id @default(uuid())
  company   Company  @relation(fields: [companyId], references: [id])
  companyId String
  date      DateTime @db.Date
  revenue   Decimal  @default(0) @db.Decimal(12, 2) // .toNumber() prima di JSON
  bookings  Int      @default(0)
  covers    Int      @default(0)
  meta      Json     @default("{}")

  @@unique([companyId, date])
  @@index([companyId, date])
}

// ─── AGENTI AI ──────────────────────────────────────

model Agent {
  id             String    @id @default(uuid())
  company        Company?  @relation(fields: [companyId], references: [id])
  companyId      String?
  name           String
  type           String
  status         String    @default("idle") // active | idle | error | paused
  currentTask    String?
  totalHandled   Int       @default(0)
  resolvedCount  Int       @default(0)      // resolution_rate = resolvedCount / totalHandled
  lastActive     DateTime?
  config         Json      @default("{}")

  logs           AgentLog[]
}

model AgentLog {
  id         String   @id @default(uuid())
  agent      Agent    @relation(fields: [agentId], references: [id])
  agentId    String
  timestamp  DateTime @default(now())
  input      String?  @db.Text
  output     String?  @db.Text
  escalated  Boolean  @default(false)
  resolved   Boolean  @default(true)
  durationMs Int?

  @@index([agentId, timestamp(sort: Desc)])
}

// ─── CLAUDE CODE ────────────────────────────────────

model CcInstance {
  id           String   @id @default(uuid())
  projectName  String
  company      Company? @relation(fields: [companyId], references: [id])
  companyId    String?
  repoUrl      String?
  currentFile  String?
  currentTask  String?
  progress     Int      @default(0)
  lastCommit   String?
  lastUpdate   DateTime @default(now())
}

// ─── BUG TRACKER ────────────────────────────────────

model Bug {
  id          String    @id @default(uuid())
  company     Company?  @relation(fields: [companyId], references: [id])
  companyId   String?
  title       String
  description String?   @db.Text
  project     String
  severity    String    @default("medium") // critical | high | medium | low
  status      String    @default("open")   // open | in_progress | resolved | closed
  createdAt   DateTime  @default(now())
  resolvedAt  DateTime?
  notes       String?   @db.Text

  @@index([status, severity])
}

// ─── WHATSAPP ───────────────────────────────────────

model WaMessage {
  id            String   @id @default(uuid())
  company       Company? @relation(fields: [companyId], references: [id])
  companyId     String?
  contactName   String?
  contactPhone  String
  message       String   @db.Text
  direction     String   // inbound | outbound
  handledByAi   Boolean  @default(false)
  escalated     Boolean  @default(false)
  aiResponse    String?  @db.Text
  timestamp     DateTime @default(now())

  @@index([contactPhone])
  @@index([timestamp(sort: Desc)])
}

// ─── EMAIL ──────────────────────────────────────────

model Email {
  id          String   @id @default(uuid())
  company     Company? @relation(fields: [companyId], references: [id])
  companyId   String?  // permette filtro per azienda
  fromEmail   String
  fromName    String?
  subject     String?
  bodyPreview String?  @db.Text
  priority    String   @default("normal") // urgent | high | normal | low
  category    String?
  aiDraft     String?  @db.Text
  read        Boolean  @default(false)
  timestamp   DateTime @default(now())

  @@index([companyId, timestamp(sort: Desc)])
}

// ─── CRM ────────────────────────────────────────────

model Contact {
  id               String    @id @default(uuid())
  name             String
  company          String?
  role             String?
  phone            String?
  email            String?
  type             String?   // socio | partner | investor | supplier | business | personal
  notes            String?   @db.Text
  lastInteraction  DateTime? @db.Date
  nextAction       String?
  nextActionDate   DateTime? @db.Date
  tags             String[]  @default([])
  meta             Json      @default("{}")

  interactions     ContactInteraction[]
  tasks            Task[]
}

model ContactInteraction {
  id        String   @id @default(uuid())
  contact   Contact  @relation(fields: [contactId], references: [id])
  contactId String
  type      String?
  notes     String?  @db.Text
  date      DateTime @db.Date @default(dbgenerated("CURRENT_DATE"))
  outcome   String?

  @@index([contactId, date])
}

// ─── CALENDARIO E TASK ──────────────────────────────

model Event {
  id            String    @id @default(uuid())
  company       Company?  @relation(fields: [companyId], references: [id])
  companyId     String?   // null = evento personale, valorizzato = evento aziendale
  title         String
  description   String?
  startAt       DateTime
  endAt         DateTime?
  location      String?
  type          String    @default("personal") // personal | business | deadline
  googleEventId String?
  allDay        Boolean   @default(false)

  @@index([startAt])
  @@index([companyId, startAt])
}

model Task {
  id          String    @id @default(uuid())
  company     Company?  @relation(fields: [companyId], references: [id])
  companyId   String?
  contact     Contact?  @relation(fields: [contactId], references: [id])
  contactId   String?
  title       String
  description String?   @db.Text
  dueDate     DateTime? @db.Date
  priority    String    @default("medium") // urgent | high | medium | low
  status      String    @default("open")   // open | in_progress | done | cancelled
  tags        String[]  @default([])
  createdAt   DateTime  @default(now())

  @@index([status, dueDate])
}

// ─── CONTABILITÀ ────────────────────────────────────

model PersonalFinance {
  id          String   @id @default(uuid())
  date        DateTime @db.Date
  amount      Decimal  @db.Decimal(12, 2) // .toNumber() prima di JSON
  category    String
  description String?
  type        String   // income | expense
  meta        Json     @default("{}")

  @@index([date])
}

model TaxDeadline {
  id          String   @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime @db.Date
  amount      Decimal? @db.Decimal(12, 2) // .toNumber() prima di JSON
  status      String   @default("pending") // pending | paid | late
  documents   String[] @default([])

  @@index([dueDate, status])
}

// ─── SALUTE E SPORT ─────────────────────────────────

model HealthMetric {
  id         String   @id @default(uuid())
  date       DateTime @unique @db.Date
  weight     Decimal? @db.Decimal(5, 2)
  steps      Int?
  sleepHours Decimal? @db.Decimal(4, 2)
  heartRate  Int?
  hrv        Int?
  calories   Int?
  notes      String?
}

model Workout {
  id          String   @id @default(uuid())
  date        DateTime @db.Date
  type        String
  durationMin Int?
  distanceKm  Decimal? @db.Decimal(6, 2)
  calories    Int?
  notes       String?

  @@index([date])
}

// ─── CASA E CONDOMINIO ──────────────────────────────

model CondoExpense {
  id          String   @id @default(uuid())
  date        DateTime @db.Date
  amount      Decimal  @db.Decimal(12, 2)
  category    String
  description String?
  paid        Boolean  @default(false)
  documents   String[] @default([])

  @@index([date])
}

model CondoMeeting {
  id        String   @id @default(uuid())
  date      DateTime @db.Date
  agenda    String?  @db.Text
  notes     String?  @db.Text
  decisions String?  @db.Text
}

// ─── DOMOTICA ───────────────────────────────────────

model HomeDevice {
  id       String    @id @default(uuid())
  name     String
  type     String
  room     String?
  status   String    @default("unknown")
  lastSeen DateTime?
  meta     Json      @default("{}")

  events   HomeEvent[]
}

model HomeEvent {
  id        String     @id @default(uuid())
  device    HomeDevice @relation(fields: [deviceId], references: [id])
  deviceId  String
  eventType String
  value     String?
  timestamp DateTime   @default(now())

  @@index([deviceId, timestamp(sort: Desc)])
  @@index([timestamp(sort: Desc)])
}

// ─── NOTIFICHE ──────────────────────────────────────

model Notification {
  id        String   @id @default(uuid())
  type      String
  title     String
  body      String?  @db.Text
  read      Boolean  @default(false)
  priority  String   @default("normal") // critical | high | normal | low
  createdAt DateTime @default(now())
  meta      Json     @default("{}")

  @@index([read, createdAt(sort: Desc)])
}
```

---

## STRUTTURA PROGETTO

```
play-group/
├── CLAUDE.md
├── README.md
├── railway.toml
├── docker-compose.yml           ← postgres + redis locali per sviluppo
├── .env.example
├── .env.local                   ← mai in git (.gitignore)
├── package.json
├── next.config.mjs              ← security headers + PWA config (Next.js 14 non supporta .ts)
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                ← protezione /admin/* (root, non dentro /app)
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── types/
│   └── index.ts                 ← tipi derivati da Prisma + tipi condivisi app
│
├── app/
│   ├── layout.tsx               ← root layout (font DM Sans, meta globali)
│   ├── globals.css
│   │
│   ├── (public)/                ── SITO PUBBLICO ──
│   │   ├── layout.tsx           ← Navbar + Footer
│   │   ├── page.tsx             ← homepage
│   │   ├── chi-siamo/page.tsx
│   │   ├── aziende/
│   │   │   ├── page.tsx
│   │   │   ├── derione/page.tsx
│   │   │   ├── play-viaggi/page.tsx
│   │   │   ├── case-vacanze/page.tsx
│   │   │   └── palermo-ft/page.tsx
│   │   ├── contatti/page.tsx
│   │   └── lavora-con-noi/page.tsx
│   │
│   ├── admin/                   ── AREA PRIVATA /admin ──
│   │   ├── layout.tsx           ← Sidebar + TopBar (auth verificata da middleware)
│   │   ├── page.tsx             ← dashboard principale
│   │   ├── aziende/page.tsx
│   │   ├── agenti/page.tsx
│   │   ├── whatsapp/page.tsx
│   │   ├── email/page.tsx
│   │   ├── crm/page.tsx
│   │   ├── calendario/page.tsx
│   │   ├── contabilita/page.tsx
│   │   ├── salute/page.tsx
│   │   ├── casa/page.tsx
│   │   ├── domotica/page.tsx
│   │   ├── bug-tracker/page.tsx
│   │   └── bull-board/          ← monitor code BullMQ (protetto da auth)
│   │
│   ├── login/page.tsx           ← pagina login NextAuth
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── chat/route.ts        ← Claude streaming SSE
│       ├── whatsapp/route.ts    ← Whapi webhook
│       ├── home/route.ts        ← Home Assistant webhook
│       └── cron/route.ts        ← trigger BullMQ jobs
│
├── components/
│   ├── public/                  ← sito pubblico
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   └── AziendeShowcase.tsx
│   ├── layout/                  ← area admin
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── dashboard/
│   │   ├── KPIBar.tsx
│   │   ├── AgentsCard.tsx
│   │   ├── ClaudeCodeCard.tsx
│   │   ├── WhatsAppCard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── AziendeGrid.tsx
│   └── chat/
│       └── AgentChat.tsx        ← chat AI sempre visibile in admin
│
├── lib/
│   ├── prisma.ts                ← singleton Prisma client
│   ├── auth.ts                  ← NextAuth config (Credentials provider)
│   ├── claude.ts                ← agente AI + context builder
│   ├── telegram.ts
│   ├── whapi.ts
│   ├── google-cal.ts
│   ├── gmail.ts
│   └── fattura24.ts
│
├── workers/                     ← BullMQ (Railway service "worker")
│   ├── index.ts                 ← entry point (tsx workers/index.ts)
│   ├── queues.ts                ← definizione code Redis
│   ├── briefing.ts              ← morning briefing ore 8:00
│   ├── sync-kpi.ts              ← sync deRione MySQL ogni ora
│   ├── sync-fatture.ts          ← sync Fattura24 ogni 6h
│   ├── sync-calendar.ts         ← sync Google Cal ogni 30min
│   ├── sync-email.ts            ← triage Gmail ogni 15min
│   └── alerts.ts                ← scadenze fiscali, anomalie KPI
│
└── public/
    ├── manifest.json            ← PWA manifest
    │                              (sw.js generato automaticamente da @ducanh2912/next-pwa)
    └── icons/                   ← icone PWA (192x192, 512x512)
```

---

## VARIABILI AMBIENTE

```env
# ── Database ──────────────────────────────────────
# DEV (docker-compose locale)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/playgroup
# PROD (Railway — da sostituire al deploy)
# DATABASE_URL=postgresql://user:pass@railway-host/playgroup

REDIS_URL=redis://localhost:6379/0
# PROD: REDIS_URL=redis://railway-redis:6379/0

# ── Auth ──────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
# PROD: NEXTAUTH_URL=https://playgroupsrl.it
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32

# ── AI ────────────────────────────────────────────
ANTHROPIC_API_KEY=

# ── WhatsApp ──────────────────────────────────────
WHAPI_TOKEN=
WHAPI_BASE_URL=https://gate.whapi.cloud

# ── Notifiche ─────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# ── Google ────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# ── Servizi ───────────────────────────────────────
FATTURA24_API_KEY=
HOME_ASSISTANT_URL=
HOME_ASSISTANT_TOKEN=

# ── App ───────────────────────────────────────────
NEXT_PUBLIC_URL=http://localhost:3000
# PROD: NEXT_PUBLIC_URL=https://playgroupsrl.it
ENVIRONMENT=development

# ── Sicurezza (solo PROD - Fase 9) ────────────────
# FIELD_ENCRYPTION_KEY=genera-con-openssl-rand-hex-32
```

---

## RAILWAY DEPLOY CONFIG

```toml
# railway.toml
[build]
builder = "nixpacks"

[[services]]
name = "web"
source = "."
startCommand = "npx prisma migrate deploy && next start"
healthcheckPath = "/"

[[services]]
name = "worker"
source = "."
startCommand = "npx tsx workers/index.ts"
```

---

## SYSTEM PROMPT AGENTE WHATSAPP

```
Sei l'assistente AI di Alessio Muzzarelli per le comunicazioni
WhatsApp delle sue aziende. Rispondi in italiano, tono
professionale e cordiale.

GESTISCI AUTONOMAMENTE:
- Info ristoranti deRione (orari, menu, prezzi, disponibilità)
- Prenotazioni tavoli (raccogli: nome, data, ora, coperti, telefono)
- Info tour Play Viaggi (destinazioni, prezzi, date partenza)
- Prenotazioni case vacanze (date, persone, prezzi)
- Saluti, ringraziamenti, info generiche

ESCALA SU TELEGRAM CON MESSAGGIO COMPLETO:
- Reclami e lamentele
- Importi superiori a €500
- Richieste di sconti o trattative
- Situazioni ambigue o tono aggressivo
- Richieste legali o burocratiche
- Richiesta esplicita di parlare con Alessio

Se sei incerto al 50% o più → escala, non improvvisare.
Non rivelare di essere un AI a meno che non venga chiesto.
```

---

## SICUREZZA PRODUZIONE (Fase 9 — dettaglio)

### Layer 1 — Auth rafforzata
- Password bcrypt salt 12
- JWT RS256 (non HS256)
- 2FA TOTP obbligatorio via `otplib` (Google Authenticator)
- Sessione 8h con refresh su attività
- Campo `twoFaDone` in `Session` per verificare completamento 2FA

### Layer 2 — Middleware
- Verifica sessione valida + `twoFaDone: true`
- IP allowlist opzionale

### Layer 3 — Rate limiting
- `rate-limiter-flexible` + `ioredis` (compatibile Railway Redis)
- Login: max 5 tentativi / 15min per IP
- OTP: max 3 tentativi → invalida sessione

### Layer 4 — Security headers (next.config.ts)
- HSTS, X-Frame-Options DENY, X-Content-Type-Options, CSP, Referrer-Policy

### Layer 5 — Cifratura campi sensibili
- AES-256-GCM via `@prisma-field-encryption`
- Chiave: `FIELD_ENCRYPTION_KEY` (env var, mai in git)
- Campi cifrati: phone, email, notes (contacts), amount/description (finance), messages (WA)

### Layer 6 — Audit log
- Ogni azione sensibile → `AuditLog` con IP + user agent

### Layer 7 — Anti-injection
- Prisma prepared statements, Next.js XSS escaping, CSRF NextAuth

### Layer 8 — Monitoraggio
- Login da IP nuovo → Telegram alert
- 3+ login falliti → Telegram alert
- Orario anomalo (02:00–06:00) → Telegram alert

---

## PRIORITÀ DI SVILUPPO

Conferma prima di ogni fase.

### FASE 1 — Foundation
- [x] 1a. CLAUDE.md completato e verificato
- [ ] 1b. Setup repo `npx create-next-app` + `package.json` con tutte le dipendenze
- [ ] 1c. `docker-compose.yml` con PostgreSQL + Redis locali
- [ ] 1d. Schema Prisma completo + `prisma migrate dev`
- [ ] 1e. Seed data realistici (`prisma/seed.ts`)
- [ ] 1f. `next.config.ts` con security headers base + PWA config

### FASE 2 — Sito pubblico
- [ ] 2a. Layout pubblico: Navbar + Footer + design system base
- [ ] 2b. Homepage playgroupsrl.it (hero, aziende, CTA)
- [ ] 2c. Pagine aziende (deRione, Play Viaggi, Case Vacanze, PALERMO FT)
- [ ] 2d. Pagine chi siamo + contatti + lavora con noi
- [ ] 2e. PWA manifest + icone

### FASE 3 — Admin shell (modalità DEV)
- [ ] 3a. Auth semplice: NextAuth Credentials, email+password, niente 2FA
- [ ] 3b. `middleware.ts` protezione /admin → redirect a /login
- [ ] 3c. Layout admin: Sidebar + TopBar
- [ ] 3d. Dashboard principale con dati mock
- [ ] 3e. Widget: KPIBar, AgentsCard, WhatsAppCard, RevenueChart, AziendeGrid

### FASE 4 — Connessioni dati reali
- [ ] 4a. Prisma queries per tutti i moduli
- [ ] 4b. BullMQ setup + workers base
- [ ] 4c. Sync Google Calendar
- [ ] 4d. Gmail triage AI

### FASE 5 — Agente AI
- [ ] 5a. `lib/claude.ts`: context builder dinamico da Prisma
- [ ] 5b. `/api/chat` con streaming SSE
- [ ] 5c. Componente `AgentChat.tsx`
- [ ] 5d. Tool calls: crea task, invia Telegram, aggiorna stati

### FASE 6 — WhatsApp + integrazioni
- [ ] 6a. Webhook Whapi → Claude → risposta / escalation Telegram
- [ ] 6b. Sync Fattura24 via BullMQ
- [ ] 6c. Home Assistant webhook
- [ ] 6d. Morning briefing BullMQ (ore 8:00)

### FASE 7 — Moduli avanzati
- [ ] 7a. CRM contatti VIP
- [ ] 7b. Bug tracker kanban
- [ ] 7c. Salute + sport (import Apple Health CSV)
- [ ] 7d. Casa + condominio
- [ ] 7e. Domotica

### FASE 8 — Deploy Railway
- [ ] 8a. `railway.toml` configurato
- [ ] 8b. Variabili ambiente Railway (prod)
- [ ] 8c. Custom domain playgroupsrl.it → DNS SiteGround
- [ ] 8d. Migrations automatiche al deploy (`prisma migrate deploy`)

### FASE 9 — Sicurezza produzione
- [ ] 9a. bcrypt + JWT RS256 + 2FA TOTP
- [ ] 9b. Rate limiting con `rate-limiter-flexible` + ioredis
- [ ] 9c. Security headers HTTP completi
- [ ] 9d. Cifratura campi sensibili (`@prisma-field-encryption`)
- [ ] 9e. AuditLog completo
- [ ] 9f. Alert Telegram login anomalo
- [ ] 9g. Penetration test base + revisione finale

---

## REGOLE PER CLAUDE CODE

1. Mostra sempre codice completo, mai troncato
2. TypeScript strict ovunque — no `any`
3. Ogni API route ha: validazione Zod, gestione errori tipizzata, risposta tipizzata
4. Ogni componente React ha: tipi TypeScript, loading state, error state
5. Aggiungi sempre `companyId` nei filtri Prisma — mai dati senza tenant
6. Campi `Decimal` Prisma: chiamare sempre `.toNumber()` prima di serializzare in JSON
7. Conferma prima di ogni fase numerata
8. Se trovi un bug durante lo sviluppo, aprilo nel bug tracker
9. Commenti solo dove la logica non è evidente
10. `sw.js` NON va creato manualmente — `@ducanh2912/next-pwa` lo genera al build
