import { useEffect, useState } from 'react'
import { useContractReads, useContractEvent } from 'wagmi'
import { CONTRACTS, type TokenPrice } from '@/constants/contracts'

export function useTokenPrices(tokenAddresses: string[]) {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({})

  const { data: priceData } = useContractReads({
    contracts: tokenAddresses.map(address => ({
      address: CONTRACTS.EXCHANGE.ADDRESS,
      abi: CONTRACTS.EXCHANGE.ABI,
      functionName: 'getPrice',
      args: [address],
    })),
    watch: true,
  })

  useEffect(() => {
    if (!priceData) return
    
    const newPrices: Record<string, TokenPrice> = {}
    tokenAddresses.forEach((address, index) => {
      newPrices[address] = {
        currentPrice: priceData[index],
        lastUpdate: Date.now(),
      }
    })
    setPrices(prevPrices => ({ ...prevPrices, ...newPrices }))
  }, [priceData, tokenAddresses])

  useContractEvent({
    address: CONTRACTS.EXCHANGE.ADDRESS,
    abi: CONTRACTS.EXCHANGE.ABI,
    eventName: 'TokensPurchased',
    listener(token, tokenAmount, ethAmount) {
      const newPrice = ethAmount / tokenAmount
      setPrices(prev => ({
        ...prev,
        [token]: {
          currentPrice: newPrice,
          priceChange24h: calculatePriceChange(prev[token]?.currentPrice, newPrice),
          lastUpdate: Date.now(),
        }
      }))
    },
  })

  return prices
}

const calculatePriceChange = (oldPrice: bigint | undefined, newPrice: bigint): number => {
  if (!oldPrice) return 0
  return (Number(newPrice - oldPrice) / Number(oldPrice)) * 100
}