import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AppProviders } from "@/components/providers/app-providers"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Workforce Management Platform",
  description: "Multi-tenant workforce management system",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
