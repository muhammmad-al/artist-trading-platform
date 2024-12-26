# Artist-Themed Token Trading Platform
A decentralized exchange platform that lets users create artist-themed tokens and trade them through an automated market maker (AMM) system. Built on Sepolia testnet with full Web3 integration.

## What This Project Does
The platform enables users to:
* Create unique ERC20 tokens tied to artist profiles
* Trade tokens through automated market making pools
* Add and remove liquidity for different token pairs 
* Track token prices and trading history in real-time

## Technical Stack
### Smart Contracts
* Solidity contracts for ERC20 token creation and AMM functionality
* Custom ArtistTokenFactory for deploying new artist tokens
* ArtistTokenExchange implementing constant product AMM formula
* Contract verification and testing on Sepolia testnet

### Backend Architecture
* Node.js/Express REST API endpoints
* PostgreSQL database for artist profiles
* Web3 integration using ethers.js
* Transaction processing and blockchain state management

### Frontend Development
* Next.js React framework with TypeScript
* RainbowKit for streamlined wallet integration
* Real-time price and liquidity tracking
* Responsive UI with Tailwind CSS

### Key Features
| Component | Technology | Purpose |
|-----------|------------|----------|
| Smart Contracts | Solidity | Token creation & trading |
| Backend | Node.js/Express | API & blockchain integration |
| Frontend | Next.js/RainbowKit | User interface & wallet connection |
| Database | PostgreSQL | Artist profile storage |

The project combines Web3 technologies with traditional web development to create a full-stack decentralized trading platform.
