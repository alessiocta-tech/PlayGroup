# PLAY GROUP — Sistema Operativo Personale
## Brief completo per Claude Code

> **Lead developer**: Claude (Anthropic)
> **Stack**: Next.js 14 + Prisma + PostgreSQL + BullMQ + Railway
> **Dominio**: playgroupsrl.it (SiteGround DNS → Railway)
> **Admin URL**: playgroupsrl.it/admin (area riservata, solo Alessio)
> **Stato**: Fase 1–7 completate — pronto per deploy Railway (Fase 8) + sito pubblico (Fase 2)
> **Ultima analisi**: 2026-04-14 — 79 file, ~8.000 righe TypeScript, 24 modelli Prisma

---

## STATO ATTUALE (2026-04-14)

### Metriche codebase
| Metrica | Valore |
|---|---|
| File TypeScript/TSX | 79 |
| Righe di codice | ~8.000 |
| Modelli Prisma | 24 |
| API routes | 15 |
| BullMQ workers | 8 |
| Componenti React | 15 |
| Integrazioni esterne | 8 (Gmail, Calendar, Contacts, Tasks, Drive, Fattura24, WhatsApp, Telegram, HA) |

### Cosa funziona oggi (con seed data)
- ✅ Login NextAuth → area `/admin` completamente funzionante
- ✅ 12 pagine admin con dati Prisma reali (non mock)
- ✅ Chat AI streaming con contesto dashboard completo
- ✅ WhatsApp webhook → Claude → risposta autonoma → escalation Telegram
- ✅ Morning briefing BullMQ ore 8:00 → Telegram
- ✅ Tutti gli 8 worker BullMQ schedulati e funzionanti
- ✅ Import CSV Apple Health
- ✅ Home Assistant webhook → aggiornamento dispositivi
- ✅ Seed DB con dati realistici (alessio@playgroupsrl.it / admin123)

### Cosa richiede configurazione prima di andare live
1. **`GOOGLE_REFRESH_TOKEN`** — visita `/api/google-auth` dopo il deploy per ottenerlo
2. **Worker Railway** — secondo servizio da creare nel dashboard
3. **DNS** — record A SiteGround → IP Railway
4. **Variabili prod** — DATABASE_URL, REDIS_URL da Railway dashboard

### Cosa non è ancora implementato
- Sito pubblico `/chi-siamo`, `/contatti`, `/lavora-con-noi`, `/aziende/[slug]`
- Tool calls agente AI (crea task, invia Telegram da chat)
- PWA (disabilitata temporaneamente per issue CSS build)
- Rate limiting (installato ma non applicato)
- 2FA TOTP (struttura DB pronta, logica non enforced)

---

## BUG NOTI E ISSUE TECNICHE

| # | Severità | File | Descrizione |
|---|---|---|---|
| 1 | HIGH | `app/api/whatsapp/route.ts` | Escalation detection `startsWith('ESCALA')` fragile — migliorare con regex |
| 2 | MEDIUM | `app/api/google-auth/route.ts` | Email `alessiocta@gmail.com` hardcoded nel `login_hint` |
| 3 | MEDIUM | `workers/index.ts` | SIGTERM handler non chiude worker con `await worker.close()` — possibile job loss |
| 4 | MEDIUM | `app/api/health/import/route.ts` | Cast `toFixed(2) as unknown as number` unsafe per campi Decimal Prisma |
| 5 | LOW | `lib/whapi.ts` | `sendWhapiMessage()` non rilancia eccezioni, solo log silenzioso |
| 6 | LOW | `app/api/claude-code/register/route.ts` | Auth con `NEXTAUTH_SECRET` come bearer token — non ideale per integrazione esterna |
| 7 | INFO | `package.json` | `rate-limiter-flexible` installato ma non ancora usato in nessuna route |
| 8 | INFO | `lib/auth.ts` | Campo `twoFaDone` presente ma middleware non lo verifica |

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

⚠️ Struttura aggiornata al 2026-04-14 — riflette i file effettivamente presenti nel repo.

```
play-group/
├── CLAUDE.md
├── railway.toml                 ← web service config; worker configurato nel dashboard Railway
├── docker-compose.yml           ← postgres + redis locali per sviluppo
├── .env.example                 ← template completo con tutte le variabili
├── .env.local                   ← mai in git (.gitignore)
├── package.json
├── next.config.mjs              ← security headers (HSTS solo PROD) + PWA disabilitato temporaneamente
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                ← protezione /admin/* (root, non dentro /app)
│
├── prisma/
│   ├── schema.prisma            ← 24 modelli, multi-tenant, relazioni complete
│   ├── seed.ts                  ← seed realistico: 4 aziende, KPI, agenti, contatti, ecc.
│   ├── cleanup.ts               ← elimina dati fake mantenendo quelli reali
│   └── migrations/
│
├── app/
│   ├── layout.tsx               ← root layout (font DM Sans, meta globali)
│   ├── globals.css
│   │
│   ├── (public)/                ── SITO PUBBLICO (parziale) ──
│   │   ├── layout.tsx           ← Navbar + Footer ✅
│   │   └── page.tsx             ← homepage base ✅ (Fase 2: pagine mancanti)
│   │
│   ├── admin/                   ── AREA PRIVATA /admin (completa) ──
│   │   ├── layout.tsx           ← Sidebar + TopBar + AgentChat floating ✅
│   │   ├── page.tsx             ← dashboard principale con KPI, chart, task ✅
│   │   ├── aziende/page.tsx     ✅
│   │   ├── agenti/page.tsx      ✅
│   │   ├── claude-code/page.tsx ✅
│   │   ├── whatsapp/page.tsx    ✅
│   │   ├── email/page.tsx       ✅
│   │   ├── crm/page.tsx         ✅
│   │   ├── calendario/page.tsx  ✅
│   │   ├── contabilita/page.tsx ✅
│   │   ├── salute/page.tsx      ✅
│   │   ├── casa/page.tsx        ✅
│   │   ├── domotica/page.tsx    ✅
│   │   └── bug-tracker/page.tsx ✅
│   │
│   ├── login/page.tsx           ← pagina login NextAuth ✅
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts  ✅
│       ├── chat/route.ts               ← Claude streaming SSE ✅
│       ├── whatsapp/route.ts           ← Whapi webhook + AI + escalation ✅
│       ├── home/route.ts               ← Home Assistant webhook ✅
│       ├── cron/route.ts               ← trigger manuale BullMQ jobs ✅
│       ├── sync-all/route.ts           ← sync parallelo email+cal+contacts+tasks ✅
│       ├── email/sync/route.ts         ✅
│       ├── calendar/sync/route.ts      ✅
│       ├── contacts/sync/route.ts      ✅
│       ├── tasks/sync/route.ts         ✅
│       ├── health/import/route.ts      ← import CSV Apple Health ✅
│       ├── drive/files/route.ts        ← Google Drive files ✅
│       ├── claude-code/register/route.ts ← registra istanza CC ✅
│       ├── google-auth/route.ts        ← OAuth flow → ottieni GOOGLE_REFRESH_TOKEN ✅
│       ├── debug-env/route.ts          ← debug variabili (auth protetto) ✅
│       └── admin-cleanup/route.ts      ← elimina dati fake ✅
│
├── components/
│   ├── public/
│   │   ├── Navbar.tsx           ✅ (con mobile menu)
│   │   ├── Footer.tsx           ✅
│   │   └── AziendeFilter.tsx    ✅
│   ├── layout/
│   │   ├── Sidebar.tsx          ✅ (12+ nav items)
│   │   └── TopBar.tsx           ✅
│   ├── dashboard/
│   │   └── SyncAllButton.tsx    ✅
│   ├── calendar/
│   │   └── SyncCalendarButton.tsx ✅
│   ├── crm/
│   │   └── SyncContactsButton.tsx ✅
│   ├── email/
│   │   └── SyncButton.tsx       ✅
│   ├── health/
│   │   └── ImportHealthButton.tsx ✅
│   ├── tasks/
│   │   └── SyncTasksButton.tsx  ✅
│   └── chat/
│       └── AgentChat.tsx        ← chat AI floating, streaming SSE ✅
│
├── lib/
│   ├── prisma.ts                ← singleton PrismaClient ✅
│   ├── auth.ts + auth.config.ts ← NextAuth v5, bcrypt, JWT ✅
│   ├── claude.ts                ← Anthropic SDK + buildDashboardContext() ✅
│   ├── telegram.ts              ✅
│   ├── whapi.ts                 ✅
│   ├── gmail.ts                 ← sync + priority classification ✅
│   ├── google-cal.ts            ← sync 30gg forward ✅
│   ├── google-contacts.ts       ← upsert via email ✅
│   ├── google-tasks.ts          ← sync task lists ✅
│   ├── google-drive.ts          ← list files ✅
│   └── fattura24.ts             ← sync fatture + scadenze IVA ✅
│
├── workers/                     ← BullMQ (Railway service "worker": tsx workers/index.ts)
│   ├── index.ts                 ← bootstrap + cron scheduling ✅
│   ├── queues.ts                ← 8 code Redis ✅
│   ├── briefing.ts              ← morning briefing ore 8:00 Roma ✅
│   ├── sync-kpi.ts              ← deRione API ogni ora ✅
│   ├── sync-fatture.ts          ← Fattura24 ogni 6h ✅
│   ├── sync-calendar.ts         ← Google Cal ogni 30min ✅
│   ├── sync-email.ts            ← Gmail ogni 15min ✅
│   ├── sync-contacts.ts         ← Google Contacts ogni 6h ✅
│   ├── sync-tasks.ts            ← Google Tasks ogni ora ✅
│   └── alerts.ts                ← scadenze fiscali ogni ora ✅
│
└── public/
    ├── manifest.json            ← PWA manifest
    └── icons/                   ← icone PWA (192x192, 512x512)
```

---

## VARIABILI AMBIENTE

Vedere `.env.example` per il template completo con istruzioni.
Variabili obbligatorie per il funzionamento:

```env
# ── Database ──────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/playgroup
REDIS_URL=redis://localhost:6379/0

# ── Auth ──────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000          # PROD: https://playgroupsrl.it
NEXTAUTH_SECRET=<openssl rand -base64 32>

# ── AI ────────────────────────────────────────────
ANTHROPIC_API_KEY=

# ── WhatsApp ──────────────────────────────────────
WHAPI_TOKEN=
WHAPI_BASE_URL=https://gate.whapi.cloud

# ── Telegram ──────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# ── Google OAuth (tutte le integrazioni Google usano queste) ──
# Ottenere GOOGLE_REFRESH_TOKEN visitando /api/google-auth dopo il deploy
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=               ← CRITICO: senza questo nessuna sync Google funziona

# ── deRione KPI (opzionale) ───────────────────────
DERIONE_KPI_URL=                    ← endpoint API deRione per sync KPI orario
DERIONE_KPI_TOKEN=

# ── Fattura24 ─────────────────────────────────────
FATTURA24_API_KEY=

# ── Home Assistant ────────────────────────────────
HOME_ASSISTANT_URL=
HOME_ASSISTANT_TOKEN=
HA_WEBHOOK_SECRET=                  ← opzionale, per verificare webhook HA

# ── App ───────────────────────────────────────────
NEXT_PUBLIC_URL=http://localhost:3000
ENVIRONMENT=development             # PROD: production (abilita HSTS)

# ── Sicurezza (solo PROD — Fase 9) ────────────────
# FIELD_ENCRYPTION_KEY=<openssl rand -hex 32>
```

---

## RAILWAY DEPLOY CONFIG

Railway richiede **due servizi separati** dallo stesso repo GitHub:

### Servizio `web` (Next.js)
Configurato in `railway.toml` — viene letto automaticamente da Railway:
```toml
[build]
builder = "nixpacks"
buildCommand = "npx prisma generate && npm run build"

[deploy]
startCommand = "npx prisma migrate deploy && npm run start"
healthcheckPath = "/api/auth/session"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Servizio `worker` (BullMQ)
Creare secondo servizio nel dashboard Railway → stesso repo → impostare:
- **Build Command**: `npx prisma generate`
- **Start Command**: `npx tsx workers/index.ts`
- **No healthcheck** (worker non espone HTTP)

### Variabili da impostare su ENTRAMBI i servizi
`DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `FATTURA24_API_KEY`,
`WHAPI_TOKEN`, `ENVIRONMENT=production`, `NEXTAUTH_URL=https://playgroupsrl.it`,
`NEXT_PUBLIC_URL=https://playgroupsrl.it`

### Procedura deploy completa
1. Push su `main` → Railway build automatico
2. `prisma migrate deploy` gira automaticamente all'avvio del web service
3. Primo avvio: visita `https://playgroupsrl.it/api/google-auth` per ottenere `GOOGLE_REFRESH_TOKEN`
4. Aggiungi `GOOGLE_REFRESH_TOKEN` alle env Railway → redeploy web + worker
5. DNS SiteGround: record A `playgroupsrl.it` → IP statico Railway

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

### FASE 1 — Foundation ✅ COMPLETA
- [x] 1a. CLAUDE.md completato e verificato
- [x] 1b. Setup repo + `package.json` con tutte le dipendenze
- [x] 1c. `docker-compose.yml` con PostgreSQL + Redis locali
- [x] 1d. Schema Prisma completo (24 modelli) + migrations
- [x] 1e. Seed data realistici (`prisma/seed.ts` — 525 righe)
- [x] 1f. `next.config.mjs` con security headers + HSTS prod

### FASE 2 — Sito pubblico (DA FARE)
- [x] 2a. Layout pubblico: Navbar + Footer + design system base
- [x] 2b. Homepage playgroupsrl.it (base)
- [ ] 2c. Pagine aziende (deRione, Play Viaggi, Case Vacanze, PALERMO FT)
- [ ] 2d. Pagine chi siamo + contatti + lavora con noi
- [ ] 2e. PWA — re-abilitare `@ducanh2912/next-pwa` in `next.config.mjs`

### FASE 3 — Admin shell ✅ COMPLETA
- [x] 3a. Auth NextAuth Credentials, bcrypt, JWT
- [x] 3b. `middleware.ts` protezione /admin → redirect a /login
- [x] 3c. Layout admin: Sidebar + TopBar + AgentChat floating
- [x] 3d. Dashboard principale con KPI, chart revenue, task aperti
- [x] 3e. Tutti i 12 moduli admin implementati con dati Prisma reali

### FASE 4 — Connessioni dati reali ✅ COMPLETA
- [x] 4a. Prisma queries su tutti i 14 moduli
- [x] 4b. BullMQ setup (8 workers, 8 code Redis)
- [x] 4c. Sync Google Calendar (30min interval)
- [x] 4d. Gmail sync + priority classification (15min interval)
- [x] 4e. Sync Google Contacts + Tasks (6h / 1h interval)

### FASE 5 — Agente AI ✅ COMPLETA
- [x] 5a. `lib/claude.ts`: `buildDashboardContext()` con tutti i dati Prisma
- [x] 5b. `/api/chat` con streaming SSE (claude-sonnet-4-6)
- [x] 5c. Componente `AgentChat.tsx` floating con history
- [ ] 5d. Tool calls: crea task, invia Telegram, aggiorna stati (da implementare)

### FASE 6 — WhatsApp + integrazioni ✅ COMPLETA
- [x] 6a. Webhook Whapi → Claude → risposta autonoma / escalation Telegram
- [x] 6b. Sync Fattura24 via BullMQ (6h) + scadenze IVA automatiche
- [x] 6c. Home Assistant webhook (stato dispositivi + alert critici)
- [x] 6d. Morning briefing BullMQ ore 8:00 Roma → Telegram

### FASE 7 — Moduli avanzati ✅ COMPLETA
- [x] 7a. CRM contatti VIP con interaction tracking
- [x] 7b. Bug tracker kanban
- [x] 7c. Salute + sport (import Apple Health CSV + visualizzazione)
- [x] 7d. Casa + condominio (spese, riunioni)
- [x] 7e. Domotica (webhook HA, stato dispositivi)

### FASE 8 — Deploy Railway (PROSSIMA)
- [x] 8a. `railway.toml` configurato (web service)
- [ ] 8b. Creare servizio `worker` Railway (stesso repo, start: `npx tsx workers/index.ts`)
- [ ] 8c. Impostare tutte le variabili ambiente in Railway (vedi sezione sopra)
- [ ] 8d. Ottenere `GOOGLE_REFRESH_TOKEN` via `/api/google-auth`
- [ ] 8e. Custom domain playgroupsrl.it → DNS SiteGround record A → Railway IP
- [ ] 8f. Verificare migrations automatiche (`prisma migrate deploy`) al primo avvio

### FASE 9 — Sicurezza produzione (dopo go-live)
- [ ] 9a. JWT RS256 + 2FA TOTP obbligatorio (`otplib`) — struttura DB già pronta
- [ ] 9b. Rate limiting su `/api/chat`, `/api/whatsapp`, login (`rate-limiter-flexible`)
- [ ] 9c. CSP header completo in `next.config.mjs`
- [ ] 9d. Cifratura campi sensibili (`@prisma-field-encryption`)
- [ ] 9e. AuditLog su tutte le azioni sensibili
- [ ] 9f. Alert Telegram: login nuovo IP, 3+ tentativi falliti, accesso 02–06
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
