import { expect } from "chai";
import { ethers } from "hardhat";
import { ArtistShares } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ArtistShares", function () {
  let artistShares: ArtistShares;
  let owner: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  
  beforeEach(async function () {
    // Get signers
    [owner, buyer] = await ethers.getSigners();
    
    // Deploy contract
    const ArtistShares = await ethers.getContractFactory("ArtistShares");
    artistShares = await ArtistShares.deploy();
  });

  describe("Artist Creation", function () {
    it("Should create an artist successfully", async function () {
      await artistShares.createArtist(1, "Drake", ethers.parseEther("0.1"), 1000);
      const artist = await artistShares.getArtistInfo(1);
      
      expect(artist.name).to.equal("Drake");
      expect(artist.basePrice).to.equal(ethers.parseEther("0.1"));
      expect(artist.totalSupply).to.equal(1000);
      expect(artist.currentSupply).to.equal(0);
    });

    it("Should not allow non-owner to create artist", async function () {
      await expect(
        artistShares.connect(buyer).createArtist(1, "Drake", ethers.parseEther("0.1"), 1000)
      ).to.be.revertedWithCustomError(artistShares, "OwnableUnauthorizedAccount");
    });
  });

  describe("Share Transactions", function () {
    beforeEach(async function () {
      await artistShares.createArtist(1, "Drake", ethers.parseEther("0.1"), 1000);
    });

    it("Should allow buying shares", async function () {
      const price = await artistShares.calculatePrice(1);
      const amount = 10;
      
      await artistShares.connect(buyer).buyShares(1, amount, {
        value: price * BigInt(amount)
      });

      expect(await artistShares.balanceOf(buyer.address, 1)).to.equal(amount);
    });

    it("Should allow selling shares", async function () {
      const buyAmount = 10;
      const price = await artistShares.calculatePrice(1);
      
      // First buy some shares
      await artistShares.connect(buyer).buyShares(1, buyAmount, {
        value: price * BigInt(buyAmount)
      });

      // Then sell them
      await artistShares.connect(buyer).sellShares(1, 5);
      expect(await artistShares.balanceOf(buyer.address, 1)).to.equal(5);
    });
  });

  describe("Price Calculation", function () {
    beforeEach(async function () {
      await artistShares.createArtist(1, "Drake", ethers.parseEther("0.1"), 1000);
    });

    it("Should increase price as more shares are bought", async function () {
      const initialPrice = await artistShares.calculatePrice(1);
      
      // Buy some shares
      await artistShares.connect(buyer).buyShares(1, 100, {
        value: initialPrice * BigInt(100)
      });

      const newPrice = await artistShares.calculatePrice(1);
      expect(newPrice).to.be.gt(initialPrice);
    });
  });
});