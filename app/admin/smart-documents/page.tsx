"use client"
/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import { useState } from "react"
import { ScanText, FileText, CheckCircle, AlertTriangle, X, Loader2, Scan, Calendar, User, FileCheck } from "lucide-react"

interface DocumentItem {
  id: string
  name: string
  status: "complete" | "missing" | "risky"
  expiryDate?: string
  uploadedBy?: string
}

interface OCRResult {
  documentType: string
  relatedPerson: string
  validityDate: string
  status: string
}

export default function SmartDocumentsPage() {
  const [selectedProject, setSelectedProject] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)

  const projects = [
    { id: "1", name: "İskenderun TOKİ Projesi" },
    { id: "2", name: "Arsuz Konutları" },
    { id: "3", name: "Dörtyol Sitesi" },
    { id: "4", name: "Erzin Proje" }
  ]

  const mockDocuments: Record<string, DocumentItem[]> = {
    "1": [
      { id: "1", name: "Yapı Ruhsatı", status: "complete", expiryDate: "15.09.2026", uploadedBy: "Ahmet Yılmaz" },
      { id: "2", name: "Yapı Denetim Sözleşmesi", status: "complete", expiryDate: "20.08.2025", uploadedBy: "Mehmet Demir" },
      { id: "3", name: "İSG Sertifikası", status: "risky", expiryDate: "02.09.2026", uploadedBy: "İSG Uzmanı" },
      { id: "4", name: "Sigorta Poliçesi", status: "complete", expiryDate: "10.12.2026", uploadedBy: "Finans Departmanı" },
      { id: "5", name: "Zemin Etüdü", status: "missing" }
    ],
    "2": [
      { id: "1", name: "Yapı Ruhsatı", status: "complete", expiryDate: "30.10.2026", uploadedBy: "Ali Kaya" },
      { id: "2", name: "Yapı Denetim Sözleşmesi", status: "missing" },
      { id: "3", name: "İSG Sertifikası", status: "complete", expiryDate: "15.11.2026", uploadedBy: "İSG Uzmanı" },
      { id: "4", name: "Sigorta Poliçesi", status: "risky", expiryDate: "05.09.2026", uploadedBy: "Finans Departmanı" },
      { id: "5", name: "Zemin Etüdü", status: "complete", expiryDate: "20.08.2025", uploadedBy: "Mühendislik" }
    ],
    "3": [
      { id: "1", name: "Yapı Ruhsatı", status: "missing" },
      { id: "2", name: "Yapı Denetim Sözleşmesi", status: "complete", expiryDate: "25.08.2025", uploadedBy: "Hasan Öztürk" },
      { id: "3", name: "İSG Sertifikası", status: "complete", expiryDate: "20.12.2026", uploadedBy: "İSG Uzmanı" },
      { id: "4", name: "Sigorta Poliçesi", status: "complete", expiryDate: "15.01.2027", uploadedBy: "Finans Departmanı" },
      { id: "5", name: "Zemin Etüdü", status: "risky", expiryDate: "10.09.2026", uploadedBy: "Mühendislik" }
    ],
    "4": [
      { id: "1", name: "Yapı Ruhsatı", status: "complete", expiryDate: "05.11.2026", uploadedBy: "Can Yılmaz" },
      { id: "2", name: "Yapı Denetim Sözleşmesi", status: "complete", expiryDate: "10.08.2025", uploadedBy: "Mehmet Demir" },
      { id: "3", name: "İSG Sertifikası", status: "missing" },
      { id: "4", name: "Sigorta Poliçesi", status: "complete", expiryDate: "20.12.2026", uploadedBy: "Finans Departmanı" },
      { id: "5", name: "Zemin Etüdü", status: "complete", expiryDate: "15.08.2025", uploadedBy: "Mühendislik" }
    ]
  }

  const handleOCRScan = async (document: DocumentItem) => {
    setSelectedDocument(document)
    setIsScanning(true)
    setOcrResult(null)
    
    // Simulate OCR scanning (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult: OCRResult = {
      documentType: "İSG Temel Eğitim Sertifikası",
      relatedPerson: "Ahmet Yılmaz",
      validityDate: "15.09.2026",
      status: "Geçerli - Sisteme işlendi."
    }
    
    setOcrResult(mockResult)
    setIsScanning(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "missing":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "risky":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-4 h-4" />
      case "missing":
        return <X className="w-4 h-4" />
      case "risky":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "complete":
        return "Tamam"
      case "missing":
        return "Eksik"
      case "risky":
        return "Riskli"
      default:
        return ""
    }
  }

  const currentDocuments = selectedProject ? mockDocuments[selectedProject] : []

  return (
    <div className="lg:mt-0 mt-16">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <ScanText className="w-8 h-8 text-blue-400" />
          Akıllı Evrak Denetimi (OCR)
        </h1>
        <p className="text-slate-400 mt-1">Yapay zeka destekli evrak tarama ve eksiklik radarı</p>
      </div>

      {/* Project Selector */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Proje (YİBF) Seçin</label>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value)
            setSelectedDocument(null)
            setOcrResult(null)
          }}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        >
          <option value="">Proje seçin...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Document Checklist */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              Zorunlu Evrak Checklist
            </h3>
            
            <div className="space-y-3">
              {currentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg border bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <h4 className="text-white font-medium">{doc.name}</h4>
                        {doc.status === "complete" && doc.uploadedBy && (
                          <p className="text-slate-400 text-sm">Yükleyen: {doc.uploadedBy}</p>
                        )}
                        {doc.expiryDate && (
                          <p className="text-slate-400 text-sm">Geçerlilik: {doc.expiryDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {getStatusLabel(doc.status)}
                      </span>
                      {doc.status !== "missing" && (
                        <button
                          onClick={() => handleOCRScan(doc)}
                          disabled={isScanning}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Scan className="w-4 h-4" />
                          OCR Tara
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Scanning Panel */}
          {selectedDocument && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ScanText className="w-5 h-5 text-blue-400" />
                OCR Tarama Sonuçları - {selectedDocument.name}
              </h3>
              
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-32 h-32 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scan className="w-12 h-12 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-white font-medium mb-2">Yapay Zeka ile Tara...</p>
                  <p className="text-slate-400 text-sm">Evrak okunuyor ve analiz ediliyor</p>
                </div>
              ) : ocrResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h4 className="text-green-400 font-medium">Tarama Başarılı</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Tespit Edilen Belge Tipi:</span>
                        <span className="text-white font-medium">{ocrResult.documentType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">İlgili Personel/Firma:</span>
                        <span className="text-white font-medium">{ocrResult.relatedPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Geçerlilik Tarihi:</span>
                        <span className="text-white font-medium">{ocrResult.validityDate}</span>
                        <span className="text-green-400 text-xs">(OCR ile okundu)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Durum:</span>
                        <span className="text-green-400 font-medium">{ocrResult.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {!selectedProject && (
        <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800">
          <ScanText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Proje Seçin</h3>
          <p className="text-slate-400">Evrak denetimi için proje seçin</p>
        </div>
      )}
    </div>
  )
}
