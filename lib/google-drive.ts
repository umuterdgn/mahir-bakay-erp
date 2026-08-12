import { google } from 'googleapis';
import { Readable } from 'stream';

export async function getDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // Terminalde sorunun nerede olduğunu görmek için logluyoruz
  console.log("--- ENV KONTROL ---");
  console.log("Client ID:", clientId ? "Okundu ✅" : "BULUNAMADI ❌");
  console.log("Client Secret:", clientSecret ? "Okundu ✅" : "BULUNAMADI ❌");
  console.log("Refresh Token:", refreshToken ? "Okundu ✅" : "BULUNAMADI ❌");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("KRITIK HATA: OAuth2 kimlik bilgileri (.env) okunamadi! Lütfen sunucuyu kapatip .next klasörünü silin ve tekrar baslatin.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function uploadPDFToDrive(fileBuffer: Buffer, fileName: string): Promise<string> {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID bulunamadı");

  const stream = Readable.from(fileBuffer);
  
  const response = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType: 'application/pdf', body: stream },
    fields: 'id, webViewLink'
  });

  if (response.data.id) {
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    });
  }

  return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
}

export async function deleteFileFromDrive(fileId: string) {
  try {
    const drive = await getDriveClient();
    await drive.files.delete({ fileId: fileId });
    return true;
  } catch (error) {
    console.error("Drive'dan dosya silinirken hata:", error);
    return false;
  }
}
