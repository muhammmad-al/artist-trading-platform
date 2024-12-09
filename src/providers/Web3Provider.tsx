'use client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config/web3'

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  console.log("Web3Provider initializing")
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}