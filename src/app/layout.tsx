import './globals.css'
import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import AuthContextProvider from '../../contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const nunito = Nunito({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Auth | Mecha Software',
  description: 'Mecha Software Authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="custom">
      <body className={nunito.className}>
        <Toaster position="bottom-right" reverseOrder={true}  />

        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  )
}
