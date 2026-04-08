import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { listGoogleDriveFiles } from '@/lib/google-drive'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const query = req.nextUrl.searchParams.get('q') ?? undefined

  try {
    const files = await listGoogleDriveFiles(query)
    return NextResponse.json({ files })
  } catch (err) {
    console.error('[Drive Files] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
