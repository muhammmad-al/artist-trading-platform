import { useMemo } from 'react'
import { useTokenList } from './useTokenList'
import { useTokenPrices } from './useTokenPrices'
import type { Token } from '@/constants/contracts'

interface TopPerformer {
  token: Token | null
  price: bigint | null
  priceChange24h: number | null
}

export function useTopPerformer() {
  const { tokens } = useTokenList()
  const prices = useTokenPrices(tokens.map(t => t.address))

  const topPerformer = useMemo(() => {
    if (!tokens.length || !Object.keys(prices).length) {
      return {
        token: null,
        price: null,
        priceChange24h: null
      }
    }

    let topToken = tokens[0]
    let topPriceChange = prices[tokens[0].address]?.priceChange24h ?? 0

    tokens.forEach(token => {
      const priceChange = prices[token.address]?.priceChange24h ?? 0
      if (priceChange > topPriceChange) {
        topToken = token
        topPriceChange = priceChange
      }
    })

    return {
      token: topToken,
      price: prices[topToken.address]?.currentPrice ?? null,
      priceChange24h: prices[topToken.address]?.priceChange24h ?? null
    }
  }, [tokens, prices])

  return topPerformer
}