// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract ArtistShares is ERC1155, Ownable {
    using Math for uint256;

    struct Artist {
        string name;
        uint256 basePrice;
        uint256 totalSupply;
        uint256 currentSupply;
    }

    mapping(uint256 => Artist) public artists;

    constructor() ERC1155("") Ownable(msg.sender) {}

    function createArtist(
        uint256 artistId, 
        string memory name,
        uint256 basePrice,
        uint256 totalSupply
    ) external onlyOwner {
        require(artists[artistId].totalSupply == 0, "Artist already exists");
        artists[artistId] = Artist(name, basePrice, totalSupply, 0);
    }

    function calculatePrice(uint256 artistId) public view returns (uint256) {
        Artist memory artist = artists[artistId];
        return artist.basePrice + ((artist.currentSupply * 1e18) / artist.totalSupply);
    }

    function buyShares(uint256 artistId, uint256 amount) external payable {
        Artist storage artist = artists[artistId];
        require(artist.totalSupply > 0, "Artist does not exist");
        require(artist.currentSupply + amount <= artist.totalSupply, "Exceeds supply");
        
        uint256 price = calculatePrice(artistId);
        require(msg.value >= price * amount, "Insufficient payment");
        
        artist.currentSupply += amount;
        _mint(msg.sender, artistId, amount, "");
    }

    function sellShares(uint256 artistId, uint256 amount) external {
        Artist storage artist = artists[artistId];
        require(balanceOf(msg.sender, artistId) >= amount, "Insufficient shares");
        
        uint256 price = calculatePrice(artistId);
        uint256 payment = price * amount;
        
        artist.currentSupply -= amount;
        _burn(msg.sender, artistId, amount);
        
        (bool sent, ) = payable(msg.sender).call{value: payment}("");
        require(sent, "Failed to send Ether");
    }

    function getArtistInfo(uint256 artistId) external view returns (Artist memory) {
        return artists[artistId];
    }
}