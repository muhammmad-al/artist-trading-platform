"use client"

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'

const ConnectButton = () => {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
        }}>
            <RainbowConnectButton />
        </div>
    )
}

export default ConnectButton