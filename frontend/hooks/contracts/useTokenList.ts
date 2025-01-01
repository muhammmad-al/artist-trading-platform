import { useEffect, useState } from 'react'
import { useContractRead, useContractEvent } from 'wagmi'
import { CONTRACTS } from '@/constants/contracts'

interface Token {
  address: string
  name: string
  symbol: string
  totalSupply: bigint
  creator: string
}

export function useTokenList() {
  const [tokens, setTokens] = useState<Token[]>([])

  // Get initial token list
  const { data: tokenAddresses } = useContractRead({
    address: CONTRACTS.FACTORY.ADDRESS,
    abi: CONTRACTS.FACTORY.ABI,
    functionName: 'getAllTokens',
    watch: true,
  })

  // Listen for new token creation events
  useContractEvent({
    address: CONTRACTS.FACTORY.ADDRESS,
    abi: CONTRACTS.FACTORY.ABI,
    eventName: 'TokenCreated',
    listener(log: any) {
      const { tokenAddress, name, symbol, totalSupply, creator } = log.args
      setTokens(prev => [...prev, {
        address: tokenAddress,
        name,
        symbol,
        totalSupply,
        creator
      }])
    },
  })

  return {
    tokens,
    isLoading: !tokenAddresses,
  }
}