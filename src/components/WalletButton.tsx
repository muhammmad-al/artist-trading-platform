'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Wallet } from 'lucide-react'

export default function WalletButton() {
  console.log("WalletButton mounting")
  const { address, isConnected } = useAccount()
  console.log("Wagmi Context:", { isConnected, address })
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() })
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  return isConnected ? (
    <button 
      onClick={() => disconnect()}
      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
    >
      <Wallet className="w-4 h-4 mr-2 text-neutral-400" />
      {address?.slice(0,6)}...{address?.slice(-4)}
    </button>
  ) : (
    <button
      onClick={handleConnect}
      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </button>
  )
}