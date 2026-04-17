-- CreateTable
CREATE TABLE "Progetto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'nuovi',
    "companyId" TEXT,
    "azienda" TEXT,
    "descrizione" TEXT,
    "toolUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'nuovo',
    "priorita" TEXT NOT NULL DEFAULT 'media',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progetto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Progetto_categoria_status_idx" ON "Progetto"("categoria", "status");

-- AddForeignKey
ALTER TABLE "Progetto" ADD CONSTRAINT "Progetto_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: BRAND ANIMAZIONE
INSERT INTO "Progetto" ("id", "nome", "categoria", "azienda", "descrizione", "toolUrl", "status", "priorita", "tags", "createdAt", "updatedAt")
VALUES (
  'proj_brand_animazione',
  'BRAND ANIMAZIONE',
  'nuovi',
  'deRione',
  'Progetto cene con animazione per deRione Talenti — Centro Commerciale. Serate tematizzate con animatori per bambini, menù dedicati e gestione degli spazi dehors.',
  '/tools/configuratore-animazione.html',
  'nuovo',
  'alta',
  ARRAY['animazione','derione','talenti','cene','bambini'],
  NOW(),
  NOW()
);
