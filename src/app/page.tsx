'use client'
import { useEffect, useState } from 'react'
import PriceGraph from '@/components/PriceGraph'
import WalletButton from '@/components/WalletButton'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  console.log("Home page rendering, mounted:", mounted)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-neutral-950">
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 50 }}>
        <WalletButton />
      </div>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 p-6 min-h-[600px]">
          <PriceGraph />
        </div>
      </main>
    </div>
)
}