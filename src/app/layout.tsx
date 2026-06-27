import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { Toaster } from 'sonner'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MUBCPC',
  description: 'Monipur Uccha Biddayala & College film & Photography Club — Capturing Moments. Preserving Stories.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MUBCPC',
  },
  openGraph: {
    title: 'MUBC Photography Club',
    description: 'Capturing Moments. Preserving Stories.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${cinzel.variable} ${inter.variable}`}>
      <head> <link rel="icon" href="/favicon.ico" sizes="any" />
             <link rel="icon" href="/favicon-32x32.png" type="image/png" />
             <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head> 
      <body className={`antialiased bg-[#0a0a0f] text-gray-100 ${inter.className}`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181f',
                border: '1px solid rgba(245,158,11,0.2)',
                color: '#e5e7eb',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
