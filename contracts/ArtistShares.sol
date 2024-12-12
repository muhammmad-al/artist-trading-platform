// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArtistShares
 * @notice Implements a fractionalized NFT system for artist shares using ERC1155
 */
contract ArtistShares is ERC1155, Ownable {
    // Artist information struct
    struct Artist {
        uint256 basePrice;      // Base price in wei
        uint256 totalSupply;    // Maximum supply of shares
        uint256 currentSupply;  // Current circulating supply
        bool exists;            // Whether this artist has been initialized
    }

    // Mapping from artist ID to their information
    mapping(uint256 => Artist) public artists;

    // Events
    event ArtistCreated(uint256 indexed artistId, uint256 basePrice, uint256 totalSupply);
    event SharesPurchased(uint256 indexed artistId, address indexed buyer, uint256 amount, uint256 price);
    event SharesSold(uint256 indexed artistId, address indexed seller, uint256 amount, uint256 price);

    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @notice Creates a new artist token
     */
    function createArtist(uint256 artistId, uint256 basePrice, uint256 totalSupply) external onlyOwner {
        require(!artists[artistId].exists, "Artist already exists");
        require(totalSupply > 0, "Total supply must be positive");
        require(basePrice > 0, "Base price must be positive");

        artists[artistId] = Artist({
            basePrice: basePrice,
            totalSupply: totalSupply,
            currentSupply: 0,
            exists: true
        });

        emit ArtistCreated(artistId, basePrice, totalSupply);
    }

    /**
     * @notice Calculates current share price based on bonding curve (shares price increases as demand increases)
     */
    function getCurrentPrice(uint256 artistId) public view returns (uint256) {
        Artist memory artist = artists[artistId];
        require(artist.exists, "Artist does not exist");
        
        return artist.basePrice + ((artist.currentSupply * 1e18) / artist.totalSupply);
    }

    /**
     * @notice Allows users to purchase shares of an artist
     */
    function buyShares(uint256 artistId, uint256 amount) external payable {
        Artist storage artist = artists[artistId];
        require(artist.exists, "Artist does not exist");
        require(artist.currentSupply + amount <= artist.totalSupply, "Exceeds total supply");

        uint256 price = getCurrentPrice(artistId);
        uint256 totalCost = price * amount;
        require(msg.value >= totalCost, "Insufficient payment");

        // Mint shares to buyer
        artist.currentSupply += amount;
        _mint(msg.sender, artistId, amount, "");

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit SharesPurchased(artistId, msg.sender, amount, price);
    }

    /**
     * @notice Allows users to sell their shares
     */
    function sellShares(uint256 artistId, uint256 amount) external {
        Artist storage artist = artists[artistId];
        require(artist.exists, "Artist does not exist");
        require(balanceOf(msg.sender, artistId) >= amount, "Insufficient shares");

        uint256 price = getCurrentPrice(artistId);
        uint256 totalPayout = price * amount;

        artist.currentSupply -= amount;
        _burn(msg.sender, artistId, amount);

        payable(msg.sender).transfer(totalPayout);

        emit SharesSold(artistId, msg.sender, amount, price);
    }
}