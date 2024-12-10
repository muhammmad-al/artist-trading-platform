import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from "@/components/ui/button"

export const WalletButton = () => {
  // Hook that provides wallet connection functionality
  // connectors are different wallet options (MetaMask, WalletConnect, etc.)
  const { connect, connectors } = useConnect()
  
  // Hook that gives us wallet state:
  // - address: the connected wallet address
  // - isConnected: boolean indicating if wallet is connected
  const { address, isConnected } = useAccount()
  
  // Hook that lets us disconnect the wallet
  const { disconnect } = useDisconnect()

  // If wallet is connected, show address and disconnect button
  if (isConnected && address) {
    return (
      <Button 
        onClick={() => disconnect()}
        variant="outline"
      >
        {/* Show abbreviated wallet address: 0x1234...5678 */}
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  // If not connected, show connect button
  return (
    <Button 
      // Use first available connector (usually MetaMask)
      onClick={() => connect({ connector: connectors[0] })}
      variant="outline"
    >
      Connect Wallet
    </Button>
  )
}