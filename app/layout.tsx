import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finance-tracker',
  description: 'A simple web application for tracking personal finances.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
