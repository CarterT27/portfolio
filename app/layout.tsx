import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AvatarProvider } from "@/context/AvatarContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Carter Tran | Portfolio",
  description: "Personal portfolio website of Carter Tran, Software Engineer, Data Scientist, and Machine Learning enthusiast.",
  icons: {
    icon: [
      { url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👾</text></svg>" }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          storageKey="theme-preference"
        >
          <AvatarProvider>{children}</AvatarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'