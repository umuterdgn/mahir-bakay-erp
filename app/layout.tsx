import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mahir Bakay Mühendislik",
  description: "Geleceği inşa eden mühendislik çözümleri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
