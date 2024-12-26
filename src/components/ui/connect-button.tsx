// src/components/ui/connect-button.tsx
"use client"

const ConnectButton = () => {
    return (
        <button 
            style={{
                position: 'fixed',  // This ensures it stays in position regardless of scroll
                top: '20px',       // Distance from top
                right: '20px',     // Distance from right
                padding: '10px 20px',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
            }}
        >
            Connect
        </button>
    )
}

export default ConnectButton