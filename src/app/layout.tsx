import { WagmiConfig, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { createPublicClient, http } from 'viem'

// Create wagmi config for Web3 functionality
const config = createConfig({
  // Automatically try to connect to previously connected wallet
  autoConnect: true,
  // Set up public client for reading blockchain data
  publicClient: createPublicClient({
    chain: mainnet,  // Use Ethereum mainnet
    transport: http() // Use HTTP for blockchain communication
  })
})

// Root layout component that wraps entire app
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* WagmiConfig provides Web3 functionality to all child components */}
        <WagmiConfig config={config}>
          {children}
        </WagmiConfig>
      </body>
    </html>
  )
}