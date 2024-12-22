const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Artist Token Platform", function () {
    let owner, addr1, addr2;
    let factory, exchange;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        
        const ArtistTokenFactory = await ethers.getContractFactory("ArtistTokenFactory");
        const ArtistTokenExchange = await ethers.getContractFactory("ArtistTokenExchange");

        factory = await ArtistTokenFactory.deploy();
        exchange = await ArtistTokenExchange.deploy(await factory.getAddress());
    });

    describe("ArtistToken", function () {
        it("Should deploy with correct initial supply", async function () {
            const ArtistToken = await ethers.getContractFactory("ArtistToken");
            const supply = ethers.parseEther("1000000");
            const token = await ArtistToken.deploy(
                "Drake Token", 
                "DRAK", 
                supply,
                owner.address
            );

            expect(await token.totalSupply()).to.equal(supply);
            expect(await token.balanceOf(owner.address)).to.equal(supply);
        });
    });

    describe("ArtistTokenFactory", function () {
        it("Should create new tokens with correct ownership", async function () {
            // Create token through factory
            await factory.createToken(
                "Drake Token",
                "DRAK",
                ethers.parseEther("1000000")
            );

            // Get token address and contract
            const tokenAddress = await factory.getTokenBySymbol("DRAK");
            const token = await ethers.getContractAt("ArtistToken", tokenAddress);

            // Check ownership and balance
            expect(await token.owner()).to.equal(owner.address);
            expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
        });
    });

    describe("ArtistTokenExchange", function () {
        let token;
        let tokenAddress;

        beforeEach(async function () {
            // Create token
            await factory.createToken(
                "Drake Token",
                "DRAK",
                ethers.parseEther("1000000")
            );
            
            tokenAddress = await factory.getTokenBySymbol("DRAK");
            token = await ethers.getContractAt("ArtistToken", tokenAddress);

            // Verify balance
            const ownerBalance = await token.balanceOf(owner.address);
            expect(ownerBalance).to.equal(ethers.parseEther("1000000"));
        });

        it("Should add initial liquidity", async function () {
            // Approve exchange
            await token.approve(
                await exchange.getAddress(),
                ethers.parseEther("1000")
            );

            // Add liquidity
            await exchange.addLiquidity(tokenAddress, {
                value: ethers.parseEther("1")
            });

            // Verify liquidity
            const [tokenLiq, ethLiq] = await exchange.getLiquidity(tokenAddress);
            expect(ethLiq).to.equal(ethers.parseEther("1"));
            expect(tokenLiq).to.equal(ethers.parseEther("1000"));
        });

        it("Should allow token purchases", async function () {
            // Add initial liquidity
            await token.approve(
                await exchange.getAddress(),
                ethers.parseEther("1000")
            );
            await exchange.addLiquidity(tokenAddress, {
                value: ethers.parseEther("1")
            });

            // Buy tokens
            await exchange.connect(addr1).buyTokens(
                tokenAddress,
                0,
                { value: ethers.parseEther("0.1") }
            );

            // Verify purchase
            const balance = await token.balanceOf(addr1.address);
            expect(balance).to.be.gt(0);
        });
    });
});