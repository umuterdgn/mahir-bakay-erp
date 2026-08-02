import { google } from 'googleapis'
import { Readable } from 'stream'

const OAuth2 = google.auth.OAuth2

export async function getDriveClient() {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  )

  // For service account or other auth methods, configure accordingly
  // This is a basic setup - you may need to adjust based on your auth flow
  
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
  })

  return drive
}

export async function uploadPDFToDrive(
  fileBuffer: Buffer,
  fileName: string,
  folderId?: string
): Promise<string> {
  const drive = await getDriveClient()

  const fileMetadata = {
    name: fileName,
    mimeType: 'application/pdf',
    parents: folderId ? [folderId] : undefined
  }

  // Convert Buffer to Readable stream for Google Drive API
  const stream = Readable.from(fileBuffer)

  const media = {
    mimeType: 'application/pdf',
    body: stream
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  })

  if (response.data.id) {
    // Make file publicly viewable (optional, adjust permissions as needed)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })
  }

  return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`
}