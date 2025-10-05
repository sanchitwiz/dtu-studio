"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"  // Add this import
import Footer from "./Footer"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
      <Footer />
    </SessionProvider>
  )
}
