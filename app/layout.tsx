import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MusicProvider from "@/components/MusicProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Integrity Gauge",
  description: "Game by Dahab Bagus Perkasa and Akhmad Thoriq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MusicProvider />
        {children}
      </body>
    </html>
  );
}
