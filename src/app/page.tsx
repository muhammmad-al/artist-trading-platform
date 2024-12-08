'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
    console.log('Component mounted')
  }, [])

  const handleConnect = async () => {
    console.log('Connect button clicked')
    try {
      console.log('Attempting to connect...')
      await connect({ connector: injected() })
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  if (!mounted) return null

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Artist Trading Platform</h1>
      
      {isConnected ? (
        <div className="space-y-4">
          <p>Connected to: {address?.slice(0,6)}...{address?.slice(-4)}</p>
          <button 
            onClick={() => disconnect()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 active:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}