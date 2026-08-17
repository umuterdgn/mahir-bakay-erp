"use client";

import React, { useEffect, useRef, useState } from "react";
import { AcApDocManager } from "@mlightcad/cad-simple-viewer";
import { toast } from "react-hot-toast";

// --- NÜKLEER HACK: Tarayıcının WebGL oluşturma kurallarını eziyoruz ---
if (typeof window !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  (HTMLCanvasElement.prototype as any).getContext = function (type: string, attributes: any, ...args: any[]) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      attributes = attributes || {};
      attributes.preserveDrawingBuffer = true; // Kütüphane ne derse desin bunu ZORLA aktif et
    }
    return originalGetContext.call(this, type, attributes, ...args);
  };
}
// ---------------------------------------------------------------------

interface AnnotatableViewerProps {
  fileUrl: string;
  onSaveAnnotation?: (dataUrl: string) => void;
}

export default function AnnotatableFloorPlanViewer({ fileUrl, onSaveAnnotation }: AnnotatableViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const initLock = useRef(false);
  // Çizim yaparken bulaşmayı (smearing) önlemek için snapshot ve başlangıç noktası
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  // isDrawingMode boolean'ını iptal edip yerine drawTool state'i getiriyoruz
  const [drawTool, setDrawTool] = useState<'pen' | 'square' | 'circle' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isWhiteBg, setIsWhiteBg] = useState(false);

  // THREE.JS HACK FONKSİYONU: Motorun arka plan rengini doğrudan değiştirir
  const forceThreeJsBackground = (isWhite: boolean) => {
    try {
      const doc = viewerInstanceRef.current;
      if (doc && doc._context && doc._context._view) {
        const view = doc._context._view;
        // 1. İhtimal: Kütüphanenin kendi arka plan metodu
        if (view.activeLayoutView && typeof view.activeLayoutView.setBackgroundColor === 'function') {
          const color = isWhite ? 255 : 0;
          view.activeLayoutView.setBackgroundColor(color, color, color);
        }
        // 2. İhtimal: Doğrudan Three.js WebGL Renderer Hack
        if (view._renderer && view._renderer._renderer) {
          // Three.js setClearColor (Hexadecimal beyaz: 0xffffff, siyah: 0x000000)
          view._renderer._renderer.setClearColor(isWhite ? 0xffffff : 0x000000, 1);
        }
      }
    } catch (e) {
      console.warn("Arka plan hacklenirken ufak pürüz:", e);
    }
  };

  const handleZoomExtents = () => {
    console.log("🎯 Ekrana Sığdır butonuna basıldı.");
    try {
      if (containerRef.current) {
        const cadCanvas = containerRef.current.querySelector('canvas:first-of-type') as HTMLElement;
        if (cadCanvas) cadCanvas.style.zIndex = '5';
      }

      const doc = viewerInstanceRef.current;
      if (!doc) return;
      const view = doc._context?._view;

      // 🔍 GERÇEK İFŞASI: Sahnedeki Obje (Çizgi) Sayısını Say
      if (view && view._scene && view._scene._scene) {
          const objectCount = view._scene._scene.children.length;
          console.log(`🏗️ SAHNEDEKİ TOPLAM OBJE (ÇİZGİ) SAYISI: ${objectCount}`);
          
          if (objectCount <= 1) {
              console.error("🚨 DİKKAT: Kütüphane dosyayı okuduğunu iddia ediyor ama SAHNEYE HİÇBİR ÇİZGİ ÇIKARAMAMIŞ! (0 Obje). Sorun muhtemelen DWG formatı desteklenmemesi veya dosyanın boş Layout'ta açılması.");
          }
      }

      if (view && typeof view.animate === 'function') view.animate();

      // ZOOM İŞLEMİ (Güvenlik zırhlı)
      try {
         // Eğer sahne boşsa zoom yapmaya çalışma (pointToBox hatasını önler)
         const objectCount = view?._scene?._scene?.children?.length || 0;
         if (objectCount <= 4) {
             console.warn("Sahne boş olduğu için Zoom Extents iptal edildi.");
             return; 
         }

         if (doc._commandManager && typeof doc._commandManager.executeCommand === 'function') {
             doc._commandManager.executeCommand('ZOOM', 'E');
         } else if (view && view.activeLayoutView && typeof view.activeLayoutView.zoomExtents === 'function') {
             view.activeLayoutView.zoomExtents();
         }
      } catch(err) {
         console.warn("Zoom işlemi atlandı:", err);
      }

      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    } catch (e) {
      console.error("Beklenmeyen Zoom Hatası:", e);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !fileUrl) return;

    if (initLock.current) return;
    initLock.current = true;

    let isMounted = true;
    let docInstance: any = null;

    async function init() {
      try {
        setLoading(true);
        containerRef.current!.style.width = '100%';
        containerRef.current!.style.height = '600px';

        let existingInstance: any = null;
        try { existingInstance = AcApDocManager.instance; } catch (e) { }

        if (existingInstance && typeof existingInstance.dispose === 'function') {
          try { existingInstance.dispose(); } catch (e) { }
        }

        try {
          AcApDocManager.createInstance({ 
            container: containerRef.current!,
            preserveDrawingBuffer: true
          });
          docInstance = AcApDocManager.instance;
          viewerInstanceRef.current = docInstance;
        } catch (e) {
          return;
        }

        if (!docInstance) return;

        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const fileContent = new Uint8Array(arrayBuffer);
        
        // 🧬 DNA TESTİ: Dosyanın GERÇEK formatını bayt (header) okuyarak anla
        const header = new TextDecoder().decode(fileContent.slice(0, 6));
        const isDWG = header.includes("AC10"); // DWG dosyaları AC10 ile başlar
        const finalFileName = isDWG ? "project_file.dwg" : "project_file.dxf";
        console.log(`🧬 DNA Testi Sonucu: Header [${header}], Seçilen Format: ${finalFileName}`);

        if (typeof docInstance.openDocument === 'function') {
           try {
               await docInstance.openDocument(finalFileName, fileContent, { readOnly: true });
               
               setTimeout(() => {
                   if (!isMounted) return;
                   
                   try {
                       const view = docInstance._context?._view;
                       if (view && view._canvas && containerRef.current) {
                           if (!containerRef.current.contains(view._canvas)) {
                               containerRef.current.appendChild(view._canvas);
                           }
                       }
                   } catch(e) {}

                   forceThreeJsBackground(isWhiteBg);
                   handleZoomExtents(); // İlk deneme
                   
                   // 📡 RADAR DÖNGÜSÜ: Arka planda yavaş yüklenen çizgileri pusuda bekle
                   let attempts = 0;
                   const radar = setInterval(() => {
                       attempts++;
                       try {
                           const view = docInstance._context?._view;
                           if (view && view._scene && view._scene._scene) {
                               const count = view._scene._scene.children.length;
                               console.log(`📡 RADAR (Deneme ${attempts}): Sahnede ${count} obje var.`);
                               
                               if (count > 4) {
                                   console.log("🎉 BİNGO! Çizgiler sahneye düştü! Ekrana Sığdır tetikleniyor...");
                                   if (typeof view.animate === 'function') view.animate();
                                   handleZoomExtents();
                                   clearInterval(radar); // Bulduk, radarı kapat
                               }
                           }
                       } catch(e) {}
                       
                       if (attempts > 15) { // 30 saniye bekledik gelmediyse vazgeç
                           clearInterval(radar);
                           console.log("🛑 Radar durduruldu: 30 saniye boyunca sahneye yeni obje gelmedi.");
                       }
                   }, 2000);
                   
               }, 1000);
               
           } catch (parseErr) {
               console.error("❌ Parse Hatası:", parseErr);
           }
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
      initLock.current = false;
      try {
        if (docInstance && typeof docInstance.dispose === 'function') {
          docInstance.dispose();
        }
      } catch (e) { }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    canvasRef.current.width = containerRef.current.clientWidth;
    canvasRef.current.height = containerRef.current.clientHeight;
  }, [loading]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedSymbol) {
      ctx.font = "32px Arial";
      ctx.fillText(selectedSymbol, x - 16, y + 16);
      return;
    }
    
    if (drawTool) {
      setIsDrawing(true);
      startPos.current = { x, y };
      // Şekil çizerken arka plan silinmesin diye mevcut tuvalin fotoğrafını al
      snapshot.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (drawTool === 'pen') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawTool || selectedSymbol || !canvasRef.current || !startPos.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Şekil çiziyorsak eski çerçeveleri silmek için snapshot'ı geri yükle
    if (drawTool !== 'pen' && snapshot.current) {
      ctx.putImageData(snapshot.current, 0, 0);
    }

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    if (drawTool === 'pen') {
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    } else if (drawTool === 'square') {
      const width = currentX - startPos.current.x;
      const height = currentY - startPos.current.y;
      ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
    } else if (drawTool === 'circle') {
      const radius = Math.sqrt(Math.pow(currentX - startPos.current.x, 2) + Math.pow(currentY - startPos.current.y, 2));
      ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Auto-save annotation when drawing stops
    if (canvasRef.current && onSaveAnnotation) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSaveAnnotation(dataUrl);
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSaveCombinedSnapshot = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const cadCanvas = containerRef.current.querySelector('canvas:not(.absolute)') as HTMLCanvasElement;
    const annotationCanvas = canvasRef.current;
    
    if (!cadCanvas) { toast.error("CAD planı bulunamadı!"); return; }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = annotationCanvas.width || cadCanvas.width;
    tempCanvas.height = annotationCanvas.height || cadCanvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = isWhiteBg ? "#ffffff" : "#111827";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(cadCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(annotationCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

    const finalImage = tempCanvas.toDataURL('image/png', 1.0);
    if (typeof onSaveAnnotation === 'function') {
        onSaveAnnotation(finalImage);
        toast.success("✅ Çizim hafızaya alındı!");
    }
  };

  const handleToggleBackground = () => {
    const newBgState = !isWhiteBg;
    setIsWhiteBg(newBgState);
    forceThreeJsBackground(newBgState); // Three.js motoruna rengi enjekte et
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  };

  return (
    <div className={`relative w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 ${isWhiteBg ? "bg-white" : "bg-slate-950"}`}>

      {/* Üst Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur p-2 rounded-lg border border-slate-700">
        <button onClick={() => { setDrawTool(null); setSelectedSymbol(null); }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!drawTool && !selectedSymbol ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>🔍 İncele</button>
        <button onClick={() => { setDrawTool('pen'); setSelectedSymbol(null); }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${drawTool === 'pen' ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>〰️ Kalem</button>
        <button onClick={() => { setDrawTool('square'); setSelectedSymbol(null); }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${drawTool === 'square' ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>🔲 Kare</button>
        <button onClick={() => { setDrawTool('circle'); setSelectedSymbol(null); }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${drawTool === 'circle' ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>⭕ Daire</button>

        <div className="w-px h-6 bg-slate-700 mx-1"></div>
        <button onClick={handleZoomExtents} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-md transition-colors border border-slate-700">🎯 Ekrana Sığdır</button>
        <button onClick={handleToggleBackground} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border border-slate-700 ${isWhiteBg ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>🌓 {isWhiteBg ? "Siyah Arka Plan" : "Beyaz Arka Plan"}</button>

        <div className="w-px h-6 bg-slate-700 mx-1"></div>
        <button onClick={() => { setDrawTool(null); setSelectedSymbol('📍'); }} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedSymbol === '📍' ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>📍</button>
        <button onClick={() => { setDrawTool(null); setSelectedSymbol('⚠️'); }} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedSymbol === '⚠️' ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>⚠️</button>
        <button onClick={() => { setDrawTool(null); setSelectedSymbol('❌'); }} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedSymbol === '❌' ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>❌</button>

        <div className="w-px h-6 bg-slate-700 mx-1"></div>
        <button onClick={clearCanvas} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-md transition-colors">🗑️ Temizle</button>

        {onSaveAnnotation && (
          <button onClick={handleSaveCombinedSnapshot} className="px-4 py-1.5 ml-2 text-xs font-bold bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors shadow-lg animate-pulse">✅ Onayla</button>
        )}
      </div>

      {/* CAD Render Alanı */}
      <div 
        ref={containerRef} 
        className="w-full h-full absolute inset-0 transition-all duration-500" 
        style={{ filter: isWhiteBg ? 'invert(1) hue-rotate(180deg)' : 'none' }}
      />

      {/* Kırmızı Kalem / Sembol Çizim Katmanı */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`absolute inset-0 z-10 ${drawTool ? "cursor-crosshair" : selectedSymbol ? "cursor-copy" : "pointer-events-none"}`}
      />
    </div>
  );
}