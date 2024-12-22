const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtistTokenExchange - Advanced Tests", function () {
    let owner, addr1, addr2, addr3;
    let factory, exchange;
    let token1, token2;
    let token1Address, token2Address;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        
        // Deploy core contracts
        const ArtistTokenFactory = await ethers.getContractFactory("ArtistTokenFactory");
        const ArtistTokenExchange = await ethers.getContractFactory("ArtistTokenExchange");

        factory = await ArtistTokenFactory.deploy();
        exchange = await ArtistTokenExchange.deploy(await factory.getAddress());

        // Create two test tokens
        await factory.createToken("Drake Token", "DRAK", ethers.parseEther("1000000"));
        await factory.createToken("Weeknd Token", "WKND", ethers.parseEther("2000000"));

        token1Address = await factory.getTokenBySymbol("DRAK");
        token2Address = await factory.getTokenBySymbol("WKND");
        
        token1 = await ethers.getContractAt("ArtistToken", token1Address);
        token2 = await ethers.getContractAt("ArtistToken", token2Address);

        // Approve exchange for both tokens
        await token1.approve(await exchange.getAddress(), ethers.parseEther("1000000"));
        await token2.approve(await exchange.getAddress(), ethers.parseEther("2000000"));
    });

    describe("Liquidity Management", function () {
        it("Should handle multiple liquidity providers", async function () {
            // First LP adds liquidity
            await token1.transfer(addr1.address, ethers.parseEther("10000"));
            await token1.connect(addr1).approve(await exchange.getAddress(), ethers.parseEther("10000"));
            
            await exchange.connect(addr1).addLiquidity(token1Address, {
                value: ethers.parseEther("10")
            });

            // Second LP adds liquidity
            await token1.transfer(addr2.address, ethers.parseEther("20000"));
            await token1.connect(addr2).approve(await exchange.getAddress(), ethers.parseEther("20000"));
            
            await exchange.connect(addr2).addLiquidity(token1Address, {
                value: ethers.parseEther("20")
            });

            const [tokenLiq, ethLiq] = await exchange.getLiquidity(token1Address);
            expect(ethLiq).to.equal(ethers.parseEther("30")); // 10 + 20
        });

        it("Should fail when adding 0 liquidity", async function () {
            await expect(
                exchange.addLiquidity(token1Address, { value: 0 })
            ).to.be.revertedWith("Must provide ETH");
        });
    });

    describe("Trading Mechanics", function () {
        beforeEach(async function () {
            // Add initial liquidity to both tokens
            await exchange.addLiquidity(token1Address, {
                value: ethers.parseEther("10")
            });
            await exchange.addLiquidity(token2Address, {
                value: ethers.parseEther("10")
            });
        });

        it("Should calculate correct fee amounts", async function () {
            const ethIn = ethers.parseEther("1");
            const tokensBought = await exchange.getTokenPurchaseAmount(token1Address, ethIn);
            
            // When trading 1 ETH with 0.3% fee:
            // Input after fee = 0.997 ETH (0.3% taken as fee)
            const inputWithFee = (ethIn * BigInt(997)) / BigInt(1000);
            
            // Expected output should consider constant product formula (x * y = k)
            // and the initial liquidity (10 ETH, 10000 tokens)
            const initialEthLiquidity = ethers.parseEther("10");
            const initialTokenLiquidity = ethers.parseEther("10000");
            
            // Calculate expected output using constant product formula
            // (x + Δx) * (y - Δy) = x * y
            // where x is ETH liquidity, y is token liquidity
            const k = initialEthLiquidity * initialTokenLiquidity;
            const newEthLiquidity = initialEthLiquidity + inputWithFee;
            const newTokenLiquidity = k / newEthLiquidity;
            const expectedOutput = initialTokenLiquidity - newTokenLiquidity;
            
            // Allow for some rounding error (0.1%)
            const tolerance = expectedOutput / BigInt(1000);
            expect(tokensBought).to.be.closeTo(expectedOutput, tolerance);
        });

        it("Should handle selling tokens back to pool", async function () {
            // First buy tokens
            await exchange.connect(addr1).buyTokens(token1Address, 0, {
                value: ethers.parseEther("1")
            });

            const tokensToSell = await token1.balanceOf(addr1.address);
            await token1.connect(addr1).approve(await exchange.getAddress(), tokensToSell);

            // Then sell them back
            await exchange.connect(addr1).sellTokens(token1Address, tokensToSell, 0);
            
            const finalBalance = await token1.balanceOf(addr1.address);
            expect(finalBalance).to.equal(0);
        });
    });

    describe("Complex Trading Scenarios", function () {
        beforeEach(async function () {
            // Add substantial liquidity
            await exchange.addLiquidity(token1Address, {
                value: ethers.parseEther("100")
            });
            await exchange.addLiquidity(token2Address, {
                value: ethers.parseEther("100")
            });
        });

        it("Should handle multiple trades in sequence", async function () {
            // Buy tokens
            await exchange.connect(addr1).buyTokens(token1Address, 0, {
                value: ethers.parseEther("1")
            });

            // Transfer some to addr2
            const balanceAddr1 = await token1.balanceOf(addr1.address);
            await token1.connect(addr1).transfer(addr2.address, balanceAddr1 / BigInt(2));

            // Both addresses sell back
            await token1.connect(addr1).approve(await exchange.getAddress(), balanceAddr1);
            await token1.connect(addr2).approve(await exchange.getAddress(), balanceAddr1 / BigInt(2));

            await exchange.connect(addr1).sellTokens(token1Address, balanceAddr1 / BigInt(2), 0);
            await exchange.connect(addr2).sellTokens(token1Address, balanceAddr1 / BigInt(2), 0);
        });

        it("Should handle simultaneous trades from multiple users", async function () {
            // Multiple users buy tokens simultaneously
            await Promise.all([
                exchange.connect(addr1).buyTokens(token1Address, 0, { value: ethers.parseEther("1") }),
                exchange.connect(addr2).buyTokens(token1Address, 0, { value: ethers.parseEther("1") }),
                exchange.connect(addr3).buyTokens(token1Address, 0, { value: ethers.parseEther("1") })
            ]);

            // Verify all users received tokens
            expect(await token1.balanceOf(addr1.address)).to.be.gt(0);
            expect(await token1.balanceOf(addr2.address)).to.be.gt(0);
            expect(await token1.balanceOf(addr3.address)).to.be.gt(0);
        });

        it("Should maintain price impact relationship", async function () {
            // Small trade
            const smallTrade = await exchange.getTokenPurchaseAmount(token1Address, ethers.parseEther("0.1"));
            
            // Large trade
            const largeTrade = await exchange.getTokenPurchaseAmount(token1Address, ethers.parseEther("10"));

            // Price impact should make large trade less efficient
            expect(largeTrade).to.be.lt(smallTrade * BigInt(100));
        });
    });
});