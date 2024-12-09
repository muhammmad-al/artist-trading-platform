import { Web3Provider } from '@/providers/Web3Provider'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("RootLayout rendering with Web3Provider")
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}