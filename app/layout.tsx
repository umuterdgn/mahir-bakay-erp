/**
 * 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import OfflineStatus from "@/components/OfflineStatus";
import OfflineSyncManager from "@/components/OfflineSyncManager";
import { ThemeProvider } from "@/components/ThemeProvider";
import AILegislationAssistant from "@/components/AILegislationAssistant";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mahir Bakay | Dijital Şantiye",
  description: "Yeni nesil şantiye ve personel yönetim ERP sistemi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Şantiye",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 dark:bg-slate-950 bg-white" suppressHydrationWarning>
        <ThemeProvider>
          <OfflineStatus />
          <OfflineSyncManager />
          <AILegislationAssistant />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
