import type { Metadata } from 'next'
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: 'Artist Trading Platform',
  description: 'Trade artist-themed tokens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* className="bg-black" ensures black background everywhere */}
      <body className="bg-black">
        {/* This is where your pages will be rendered */}
        {children}
      </body>
    </html>
  )
}