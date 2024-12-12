const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe("ArtistShares", function () {
  let ArtistShares;
  let artistShares: ArtistShares;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  // Test constants
  const ARTIST_ID = 1n;
  const BASE_PRICE = ethers.parseEther("0.1");  // 0.1 ETH
  const TOTAL_SUPPLY = 1000n;

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contract
    const ArtistSharesFactory = await ethers.getContractFactory("ArtistShares");
    artistShares = await ArtistSharesFactory.deploy() as ArtistShares;
    await artistShares.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await artistShares.owner()).to.equal(owner.address);
    });
  });

  describe("Artist Creation", function () {
    it("Should allow owner to create an artist", async function () {
      await expect(artistShares.createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY))
        .to.emit(artistShares, "ArtistCreated")
        .withArgs(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY);

      const artist = await artistShares.artists(ARTIST_ID);
      expect(artist.basePrice).to.equal(BASE_PRICE);
      expect(artist.totalSupply).to.equal(TOTAL_SUPPLY);
      expect(artist.currentSupply).to.equal(0n);
      expect(artist.exists).to.be.true;
    });

    it("Should prevent non-owners from creating artists", async function () {
      await expect(
        artistShares.connect(addr1).createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY)
      ).to.be.revertedWithCustomError(artistShares, "OwnableUnauthorizedAccount");
    });

    it("Should prevent creating duplicate artists", async function () {
      await artistShares.createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY);
      await expect(
        artistShares.createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY)
      ).to.be.revertedWith("Artist already exists");
    });

    it("Should prevent creating artist with zero base price", async function () {
      await expect(
        artistShares.createArtist(ARTIST_ID, 0n, TOTAL_SUPPLY)
      ).to.be.revertedWith("Base price must be positive");
    });

    it("Should prevent creating artist with zero total supply", async function () {
      await expect(
        artistShares.createArtist(ARTIST_ID, BASE_PRICE, 0n)
      ).to.be.revertedWith("Total supply must be positive");
    });
  });

  describe("Price Calculation", function () {
    beforeEach(async function () {
      await artistShares.createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY);
    });

    it("Should calculate correct initial price", async function () {
      const price = await artistShares.getCurrentPrice(ARTIST_ID);
      expect(price).to.equal(BASE_PRICE);
    });

    it("Should increase price as supply increases", async function () {
      // Buy some shares to increase current supply
      const amount = 100n;
      await artistShares.connect(addr1).buyShares(ARTIST_ID, amount, {
        value: BASE_PRICE * amount * 2n // Ensure enough ETH is sent
      });

      const newPrice = await artistShares.getCurrentPrice(ARTIST_ID);
      expect(newPrice).to.be.gt(BASE_PRICE);
    });

    it("Should revert for non-existent artist", async function () {
      await expect(
        artistShares.getCurrentPrice(999n)
      ).to.be.revertedWith("Artist does not exist");
    });
  });

  describe("Buying Shares", function () {
    beforeEach(async function () {
      await artistShares.createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY);
    });

    it("Should allow buying shares", async function () {
      const amount = 10n;
      const price = await artistShares.getCurrentPrice(ARTIST_ID);
      const totalCost = price * amount;

      await expect(
        artistShares.connect(addr1).buyShares(ARTIST_ID, amount, {
          value: totalCost
        })
      )
        .to.emit(artistShares, "SharesPurchased")
        .withArgs(ARTIST_ID, addr1.address, amount, price);

      expect(await artistShares.balanceOf(addr1.address, ARTIST_ID)).to.equal(amount);
    });

    it("Should refund excess payment", async function () {
      const amount = 10n;
      const price = await artistShares.getCurrentPrice(ARTIST_ID);
      const totalCost = price * amount;
      const excess = ethers.parseEther("1");

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      const tx = await artistShares.connect(addr1).buyShares(ARTIST_ID, amount, {
        value: totalCost + excess
      });

      // Account for gas costs in balance check
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      
      // Should be close to initial balance minus total cost and gas
      expect(finalBalance).to.be.closeTo(
        initialBalance - totalCost - gasCost,
        ethers.parseEther("0.0001") // Allow for small rounding differences
      );
    });

    it("Should prevent buying with insufficient payment", async function () {
      const amount = 10n;
      const price = await artistShares.getCurrentPrice(ARTIST_ID);
      const totalCost = price * amount;

      await expect(
        artistShares.connect(addr1).buyShares(ARTIST_ID, amount, {
          value: totalCost - 1n
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should prevent exceeding total supply", async function () {
      await expect(
        artistShares.connect(addr1).buyShares(ARTIST_ID, TOTAL_SUPPLY + 1n, {
          value: ethers.parseEther("1000")
        })
      ).to.be.revertedWith("Exceeds total supply");
    });
  });

  describe("Selling Shares", function () {
    const PURCHASE_AMOUNT = 100n;
    
    beforeEach(async function () {
      await artistShares.createArtist(ARTIST_ID, BASE_PRICE, TOTAL_SUPPLY);
      const price = await artistShares.getCurrentPrice(ARTIST_ID);
      await artistShares.connect(addr1).buyShares(ARTIST_ID, PURCHASE_AMOUNT, {
        value: price * PURCHASE_AMOUNT
      });
    });

    it("Should allow selling shares", async function () {
      const sellAmount = 50n;
      const price = await artistShares.getCurrentPrice(ARTIST_ID);
      const expectedPayout = price * sellAmount;

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      const tx = await artistShares.connect(addr1).sellShares(ARTIST_ID, sellAmount);
      
      // Account for gas costs
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      
      // Check balance change (accounting for gas)
      expect(finalBalance).to.be.closeTo(
        initialBalance + expectedPayout - gasCost,
        ethers.parseEther("0.0001")
      );

      // Check remaining balance of shares
      expect(await artistShares.balanceOf(addr1.address, ARTIST_ID))
        .to.equal(PURCHASE_AMOUNT - sellAmount);
    });

    it("Should prevent selling more shares than owned", async function () {
      await expect(
        artistShares.connect(addr1).sellShares(ARTIST_ID, PURCHASE_AMOUNT + 1n)
      ).to.be.revertedWith("Insufficient shares");
    });

    it("Should prevent selling shares for non-existent artist", async function () {
      await expect(
        artistShares.connect(addr1).sellShares(999n, 1n)
      ).to.be.revertedWith("Artist does not exist");
    });
  });
});