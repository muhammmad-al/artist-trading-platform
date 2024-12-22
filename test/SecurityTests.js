const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtistTokenExchange - Security Tests", function () {
    let owner, addr1, addr2, attacker;
    let factory, exchange, token;
    let tokenAddress;

    beforeEach(async function () {
        [owner, addr1, addr2, attacker] = await ethers.getSigners();
        
        const ArtistTokenFactory = await ethers.getContractFactory("ArtistTokenFactory");
        const ArtistTokenExchange = await ethers.getContractFactory("ArtistTokenExchange");

        factory = await ArtistTokenFactory.deploy();
        exchange = await ArtistTokenExchange.deploy(await factory.getAddress());

        // Create test token
        await factory.createToken("Test Token", "TEST", ethers.parseEther("1000000"));
        tokenAddress = await factory.getTokenBySymbol("TEST");
        token = await ethers.getContractAt("ArtistToken", tokenAddress);

        // Setup initial liquidity
        await token.approve(await exchange.getAddress(), ethers.parseEther("100000"));
        await exchange.addLiquidity(tokenAddress, {
            value: ethers.parseEther("100")
        });
    });

    describe("Edge Cases", function () {
        it("Should prevent trading with zero amounts", async function () {
            await expect(
                exchange.buyTokens(tokenAddress, 0, { value: 0 })
            ).to.be.revertedWith("Must send ETH");

            await expect(
                exchange.sellTokens(tokenAddress, 0, 0)
            ).to.be.revertedWith("Must send tokens");
        });

        it("Should handle max uint256 values appropriately", async function () {
            const maxUint256 = ethers.MaxUint256;
            await expect(
                exchange.buyTokens(tokenAddress, maxUint256, { value: ethers.parseEther("1") })
            ).to.be.revertedWith("Insufficient output amount");
        });

        it("Should prevent trading non-existent tokens", async function () {
            const fakeTokenAddress = "0x1234567890123456789012345678901234567890";
            await expect(
                exchange.addLiquidity(fakeTokenAddress, { value: ethers.parseEther("1") })
            ).to.be.revertedWith("Token not from factory");
        });
    });

    describe("Slippage Protection", function () {
        it("Should protect against excessive slippage in buys", async function () {
            const minTokens = ethers.parseEther("1000"); // Expecting 1000 tokens
            await expect(
                exchange.buyTokens(tokenAddress, minTokens, { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("Insufficient output amount");
        });

        it("Should protect against excessive slippage in sells", async function () {
            // First buy some tokens
            await exchange.connect(addr1).buyTokens(tokenAddress, 0, {
                value: ethers.parseEther("1")
            });

            const tokenAmount = await token.balanceOf(addr1.address);
            await token.connect(addr1).approve(await exchange.getAddress(), tokenAmount);

            // Try to sell with unrealistic minimum ETH expectation
            await expect(
                exchange.connect(addr1).sellTokens(tokenAddress, tokenAmount, ethers.parseEther("2"))
            ).to.be.revertedWith("Insufficient output amount");
        });
    });

    describe("Price Manipulation Protection", function () {
        it("Should maintain price stability across multiple trades", async function () {
            // Record initial price
            const initialPrice = await exchange.getPrice(tokenAddress);

            // Perform multiple small trades
            for(let i = 0; i < 5; i++) {
                await exchange.connect(addr1).buyTokens(tokenAddress, 0, {
                    value: ethers.parseEther("0.1")
                });
            }

            // Price should have moved, but not drastically
            const finalPrice = await exchange.getPrice(tokenAddress);
            const priceChange = finalPrice > initialPrice ? 
                finalPrice - initialPrice : 
                initialPrice - finalPrice;

            expect(priceChange).to.be.lt(initialPrice / BigInt(5)); // Less than 20% change
        });
    });

    describe("Liquidity Provider Protection", function () {
        it("Should maintain proper token ratios", async function () {
            // Add liquidity from different providers
            await token.transfer(addr1.address, ethers.parseEther("10000"));
            await token.connect(addr1).approve(await exchange.getAddress(), ethers.parseEther("10000"));
            
            await exchange.connect(addr1).addLiquidity(tokenAddress, {
                value: ethers.parseEther("10")
            });

            // Check ratio maintained
            const [tokenLiq, ethLiq] = await exchange.getLiquidity(tokenAddress);
            expect(tokenLiq / ethLiq).to.equal(BigInt(1000)); // 1:1000 ratio
        });
    });

    describe("Overflow Protection", function () {
        it("Should handle large number calculations safely", async function () {
            const largeAmount = ethers.parseEther("1000000000"); // 1 billion ETH
            const purchaseAmount = await exchange.getTokenPurchaseAmount(tokenAddress, largeAmount);
            expect(purchaseAmount).to.be.gt(0); // Should not overflow
        });
    });
});