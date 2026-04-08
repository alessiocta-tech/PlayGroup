import { getAccessToken } from '@/lib/gmail'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webViewLink: string
  size: string | null
}

interface DriveListResponse {
  files?: Array<{
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    webViewLink: string
    size?: string
  }>
}

export async function listGoogleDriveFiles(query?: string): Promise<DriveFile[]> {
  const tokenResult = await getAccessToken()
  if ('error' in tokenResult) {
    throw new Error(tokenResult.error)
  }
  const token = tokenResult.token

  const url = new URL('https://www.googleapis.com/drive/v3/files')
  url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime,webViewLink,size)')
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('orderBy', 'modifiedTime desc')

  if (query) {
    url.searchParams.set('q', `name contains '${query.replace(/'/g, "\\'")}'`)
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[GoogleDrive] API error:', errText)
    throw new Error(`Drive API error: ${errText}`)
  }

  const data = (await res.json()) as DriveListResponse
  const files = data.files ?? []

  return files.map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
    size: f.size ?? null,
  }))
}
