
import { Inter } from 'next/font/google'
import './globals.css'

import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css'

import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/component/Navbar'
import Providers from '@/component/Providers'
import { cn, constructMetadata } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const meta = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='light'>
      <Providers>
        <body
          className={cn(
            'min-h-screen font-sans antialiased grainy',
            inter.className
          )}>
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  )
}