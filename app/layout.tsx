import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stay Frosty Slushies",
  description: "Premium slushie machines for hire - perfect for parties and events!",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <AuthErrorBoundary>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </AuthErrorBoundary>
            </CartProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
