// src/constants/contracts.ts

export const CONTRACTS = {
    FACTORY: {
      ADDRESS: '0xa18A3939bcaD1616024838450f04F600e48FdC86',
      ABI: [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "tokenAddress",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "symbol",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalSupply",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "creator",
              "type": "address"
            }
          ],
          "name": "TokenCreated",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "getAllTokens",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTokenCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ] as const
    },
    EXCHANGE: {
      ADDRESS: '0xac26A10DD3eD13f813b6fE1411e82911B5DF785d',
      ABI: [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "tokenAddress",
              "type": "address"
            }
          ],
          "name": "getPrice",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenAmount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "ethAmount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            }
          ],
          "name": "TokensPurchased",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenAmount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "ethAmount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "seller",
              "type": "address"
            }
          ],
          "name": "TokensSold",
          "type": "event"
        }
      ] as const
    }
  } as const
  
  // Type for a Token
  export interface Token {
    address: string
    name: string
    symbol: string
    totalSupply: bigint
    creator: string
  }
  
  // Type for Token Price Data
  export interface TokenPrice {
    currentPrice: bigint
    priceChange24h?: number
    lastUpdate: number
  }