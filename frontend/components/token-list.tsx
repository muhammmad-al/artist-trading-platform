"use client"

import useTokenList from '@/hooks/contracts/useTokenList'
import useTokenPrices from '@/hooks/contracts/useTokenPrices'
import { useNetwork } from 'wagmi'
import { Loader2 } from 'lucide-react'

export default function TokenList() {
  const { tokens, isLoading: tokensLoading } = useTokenList()
  const { prices } = useTokenPrices(tokens?.map(t => t.address) ?? [])
  const { chain } = useNetwork()

  console.log('Current tokens:', tokens)
  console.log('Current prices:', prices)
  
  if (tokensLoading) {
    return (
      <div className="bg-neutral-900 rounded-lg p-6 mt-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          <p className="text-neutral-400">Loading tokens...</p>
        </div>
      </div>
    )
  }
  
  if (!tokens?.length) {
    console.log("No tokens available")
    return (
      <div className="bg-neutral-900 rounded-lg p-6 mt-6">
        <p className="text-neutral-400 text-center">No tokens available yet</p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 rounded-lg p-6 mt-6">
      <pre className="text-white">{JSON.stringify({ tokens, prices }, null, 2)}</pre>
    </div>
  )
}