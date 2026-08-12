import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const customName = formData.get("customName") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Check if Google Drive credentials are available
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (apiKey && folderId) {
      // Upload to Google Drive
      try {
        const auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
          scopes: ["https://www.googleapis.com/auth/drive.file"],
        })

        const drive = google.drive({ version: "v3", auth })

        const fileMetadata = {
          name: customName || file.name,
          parents: [folderId],
        }

        const media = {
          mimeType: file.type,
          body: Buffer.from(await file.arrayBuffer()),
        }

        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id,webViewLink",
        })

        if (!response.data.id) {
          throw new Error("Failed to get file ID from Google Drive")
        }

        // Make file publicly viewable
        await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        })

        return NextResponse.json(
          { 
            url: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
            filename: customName || file.name,
            driveId: response.data.id
          },
          { status: 200 }
        )
      } catch (driveError) {
        console.error("Google Drive upload failed, falling back to local:", driveError)
        // Fall back to local upload if Drive fails
      }
    }

    // Fallback: Local upload
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split(".").pop()
    const filename = customName 
      ? `${customName}.${fileExtension}`
      : `${timestamp}-${randomString}.${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    const publicUrl = `/uploads/${filename}`

    return NextResponse.json(
      { url: publicUrl, filename },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
