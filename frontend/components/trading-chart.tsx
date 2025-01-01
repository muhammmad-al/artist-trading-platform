"use client"

import { createChart, ColorType, IChartApi } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { useTopPerformer } from '@/hooks/contracts/useTopPerformer'

interface ChartData {
    time: string
    value: number
}

interface PriceStats {
    price: string
    change24h: string
    high24h: string
    low24h: string
    volume24h: string
}

export default function TradingChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chart = useRef<IChartApi | null>(null)
    const topPerformer = useTopPerformer()
    const [priceStats, setPriceStats] = useState<PriceStats>({
        price: '0.00',
        change24h: '0.00',
        high24h: '0.00',
        low24h: '0.00',
        volume24h: '0'
    })

    useEffect(() => {
        if (!chartContainerRef.current) return

        chart.current = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'rgb(17, 17, 17)' },
                textColor: '#9B9B9B',
            },
            grid: {
                vertLines: { color: '#1F1F1F' },
                horzLines: { color: '#1F1F1F' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            crosshair: {
                vertLine: { color: '#555' },
                horzLine: { color: '#555' },
            },
            rightPriceScale: {
                borderColor: '#1F1F1F',
                scaleMargins: {
                    top: 0.1,  // Add margins to the price scale
                    bottom: 0.1
                },
            },
            timeScale: {
                borderColor: '#1F1F1F',
                timeVisible: true,
                rightOffset: 12,  // Add some space on the right
                barSpacing: 8,    // Space between data points
            },
        })

        const lineSeries = chart.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            priceLineVisible: false,
        })

        // Generate more realistic looking mock data
        const now = new Date()
        const mockData: ChartData[] = []
        let price = 100

        // Generate 3 months of daily data
        for (let i = 90; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            
            // Random walk with momentum
            const change = (Math.random() - 0.5) * 4
            price = price + change + (price > 100 ? -0.1 : 0.1)  // Slight mean reversion
            
            mockData.push({
                time: date.toISOString().split('T')[0],
                value: price
            })
        }

        lineSeries.setData(mockData)

        // Add handlers for resize...
        const handleResize = () => {
            if (chartContainerRef.current && chart.current) {
                chart.current.applyOptions({ 
                    width: chartContainerRef.current.clientWidth 
                })
            }
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.current?.remove()
        }
    }, [])

    return (
        <div className="w-full bg-[rgb(17,17,17)] rounded-lg p-6">
            <div className="mb-6">
                <div className="flex items-baseline gap-4">
                    <h2 className="text-white text-2xl font-semibold">
                        Token Price
                    </h2>
                </div>
            </div>
            <div ref={chartContainerRef} style={{ height: '400px' }} /> {/* Add explicit height */}
        </div>
    )
}