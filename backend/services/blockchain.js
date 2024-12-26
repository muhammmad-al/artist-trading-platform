const ethers = require('ethers');
const path = require('path');
require('dotenv').config();

// Contract ABIs
const ArtistTokenFactory = require(path.join(__dirname, '../../artifacts/contracts/ArtistTokenFactory.sol/ArtistTokenFactory.json'));
const ArtistTokenExchange = require(path.join(__dirname, '../../artifacts/contracts/ArtistTokenExchange.sol/ArtistTokenExchange.json'));
const ArtistToken = require(path.join(__dirname, '../../artifacts/contracts/ArtistToken.sol/ArtistToken.json'));

class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        
        this.factoryAddress = '0xa18A3939bcaD1616024838450f04F600e48FdC86';
        this.exchangeAddress = '0xac26A10DD3eD13f813b6fE1411e82911B5DF785d';
        
        this.factoryContract = new ethers.Contract(
            this.factoryAddress,
            ArtistTokenFactory.abi,
            this.signer
        );
        
        this.exchangeContract = new ethers.Contract(
            this.exchangeAddress,
            ArtistTokenExchange.abi,
            this.signer
        );
    }

    async createToken(name, symbol, totalSupply) {
        try {
            const tx = await this.factoryContract.createToken(
                name,
                symbol,
                ethers.parseEther(totalSupply.toString())
            );
            const receipt = await tx.wait();
            
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'TokenCreated'
            );
            
            return {
                success: true,
                tokenAddress: event.args.tokenAddress,
                txHash: receipt.hash
            };
        } catch (error) {
            console.error('Error creating token:', error);
            return { success: false, error: error.message };
        }
    }

    async getTokenInfo(tokenAddress) {
        try {
            const token = new ethers.Contract(tokenAddress, ArtistToken.abi, this.provider);
            const [name, symbol, supply, owner] = await token.getTokenInfo();
            return {
                success: true,
                info: { name, symbol, supply: ethers.formatEther(supply), owner }
            };
        } catch (error) {
            console.error('Error getting token info:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllTokens() {
        try {
            const tokens = await this.factoryContract.getAllTokens();
            const tokenDetails = await Promise.all(
                tokens.map(async (address) => {
                    const token = new ethers.Contract(address, ArtistToken.abi, this.provider);
                    const [name, symbol, supply, owner] = await token.getTokenInfo();
                    return { address, name, symbol, supply: ethers.formatEther(supply), owner };
                })
            );
            return { success: true, tokens: tokenDetails };
        } catch (error) {
            console.error('Error getting tokens:', error);
            return { success: false, error: error.message };
        }
    }

    async addLiquidity(tokenAddress, ethAmount) {
        try {
            const tokenContract = new ethers.Contract(
                tokenAddress,
                ArtistToken.abi,
                this.signer
            );

            const tokenAmount = ethers.parseEther(ethAmount.toString()) * BigInt(1000);

            const approveTx = await tokenContract.approve(
                this.exchangeAddress,
                tokenAmount
            );
            await approveTx.wait();

            const tx = await this.exchangeContract.addLiquidity(
                tokenAddress,
                { value: ethers.parseEther(ethAmount.toString()) }
            );
            const receipt = await tx.wait();
            
            return { 
                success: true, 
                txHash: receipt.hash,
                approvalTxHash: approveTx.hash
            };
        } catch (error) {
            console.error('Error adding liquidity:', error);
            return { success: false, error: error.message };
        }
    }

    async getTokenPrice(tokenAddress) {
        try {
            const price = await this.exchangeContract.getPrice(tokenAddress);
            return { 
                success: true, 
                price: ethers.formatEther(price)
            };
        } catch (error) {
            console.error('Error getting token price:', error);
            return { success: false, error: error.message };
        }
    }

    async buyTokens(tokenAddress, ethAmount, minTokens) {
        try {
            const tx = await this.exchangeContract.buyTokens(
                tokenAddress,
                ethers.parseEther(minTokens.toString()),
                { value: ethers.parseEther(ethAmount.toString()) }
            );
            const receipt = await tx.wait();
            return { success: true, txHash: receipt.hash };
        } catch (error) {
            console.error('Error buying tokens:', error);
            return { success: false, error: error.message };
        }
    }

    async sellTokens(tokenAddress, tokenAmount, minEth) {
        try {
            const tokenContract = new ethers.Contract(
                tokenAddress,
                ArtistToken.abi,
                this.signer
            );

            const tokenAmountWei = ethers.parseEther(tokenAmount.toString());
            const approveTx = await tokenContract.approve(
                this.exchangeAddress,
                tokenAmountWei
            );
            await approveTx.wait();

            const tx = await this.exchangeContract.sellTokens(
                tokenAddress,
                tokenAmountWei,
                ethers.parseEther(minEth.toString())
            );
            const receipt = await tx.wait();
            
            return { 
                success: true, 
                txHash: receipt.hash,
                approvalTxHash: approveTx.hash
            };
        } catch (error) {
            console.error('Error selling tokens:', error);
            return { success: false, error: error.message };
        }
    }

}

module.exports = new BlockchainService();