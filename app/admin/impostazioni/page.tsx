import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import RegisterBiometric from '@/components/auth/RegisterBiometric'

export default async function ImpostazioniPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
      createdAt: true,
      lastUsed: true,
      deviceType: true,
    },
  })

  type SerializedCred = {
    id: string; label: string; createdAt: string; lastUsed: string | null; deviceType: string
  }
  const serialized: SerializedCred[] = credentials.map((c) => ({
    id: c.id,
    label: c.label,
    createdAt: c.createdAt.toISOString(),
    lastUsed: c.lastUsed?.toISOString() ?? null,
    deviceType: c.deviceType,
  }))

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Impostazioni</h1>
        <p className="text-sm text-gray-500 mt-1">Account e sicurezza</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl p-5">
        <h2 className="font-extrabold text-[#111111] mb-3">Account</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F0C040] rounded-xl flex items-center justify-center text-[#111111] font-extrabold text-lg flex-shrink-0">
            {(session.user.name ?? session.user.email ?? 'A')[0].toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#111111]">{session.user.name}</div>
            <div className="text-xs text-gray-500">{session.user.email}</div>
          </div>
        </div>
      </div>

      {/* Biometric / WebAuthn */}
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-extrabold text-[#111111]">Accesso biometrico</h2>
          <p className="text-xs text-gray-500 mt-1">
            Registra l&apos;impronta digitale o Face ID del tuo telefono per accedere senza password dalla PWA.
          </p>
        </div>
        <RegisterBiometric credentials={serialized} />
      </div>

      {/* PWA install hint */}
      <div className="bg-[#111111] rounded-2xl p-5 text-white">
        <h2 className="font-extrabold mb-2">Installa la PWA</h2>
        <div className="text-xs text-gray-400 space-y-1.5">
          <p className="flex items-start gap-2">
            <span className="text-[#F0C040] flex-shrink-0 font-bold">iOS</span>
            Safari → tocca &quot;Condividi&quot; → &quot;Aggiungi a schermata Home&quot;
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#F0C040] flex-shrink-0 font-bold">Android</span>
            Chrome → menu ⋮ → &quot;Aggiungi a schermata Home&quot; o &quot;Installa app&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
