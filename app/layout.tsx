import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { LanguageProvider } from "@/components/language/language-provider"
import { ExpProvider } from "@/components/exp/exp-context"
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CareConnect - Digital Medical Assistance",
  description: "Healthcare platform connecting patients and doctors seamlessly",
  themeColor: "#0ea5e9",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/images/careconnect-logo.png",
    apple: "/images/careconnect-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
        variables: {
          colorPrimary: '#3b82f6',
          borderRadius: '0.75rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ExpProvider>
              <LanguageProvider>
                <PWAProvider>
                  <NotificationProvider>
                    {children}
                    <Toaster />
                  </NotificationProvider>
                </PWAProvider>
              </LanguageProvider>
            </ExpProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

