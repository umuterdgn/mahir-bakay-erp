/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import CryptoJS from "crypto-js"

const SECRET_KEY = process.env.NFC_SECRET_KEY || "MahirBakay2026SecureKey"

export interface NfcPayload {
  id: string
  timestamp: number
  company: string
}

/**
 * Encrypt NFC payload data using AES
 */
export function encryptNfcData(payload: NfcPayload): string {
  const jsonString = JSON.stringify(payload)
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
  return encrypted
}

/**
 * Decrypt NFC payload data using AES
 */
export function decryptNfcData(encryptedData: string): NfcPayload | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
    const payload = JSON.parse(decryptedString) as NfcPayload
    
    // Validate payload structure
    if (!payload.id || !payload.timestamp || !payload.company) {
      return null
    }
    
    return payload
  } catch (error) {
    console.error("NFC decryption error:", error)
    return null
  }
}

/**
 * Create NFC payload for personnel
 */
export function createPersonnelNfcPayload(personnelId: string): string {
  const payload: NfcPayload = {
    id: personnelId,
    timestamp: Date.now(),
    company: "MahirBakay"
  }
  return encryptNfcData(payload)
}
