// src/app/page.tsx
import ConnectButton from '@/components/connect-button'
import TradingChart from '@/components/trading-chart'

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black',
      padding: '48px'  // This gives space on all sides
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '0', 
          right: '0' 
        }}>
          <ConnectButton />
        </div>
      </div>

      <div style={{ marginTop: '36px' }}> {/* Space between button and chart */}
        <TradingChart />
      </div>
    </main>
  )
}