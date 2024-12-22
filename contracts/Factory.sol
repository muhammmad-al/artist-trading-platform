// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ArtistToken.sol";

contract ArtistTokenFactory {
    // State variables
    mapping(address => bool) public isArtistToken;
    mapping(string => address) public artistToToken;
    mapping(string => address) public symbolToToken;
    address[] public allTokens;
    
    // Events
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 totalSupply,
        address creator
    );
    
    // Create new artist token
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) public returns (address) {
        // Check if artist or symbol already exists
        require(artistToToken[name] == address(0), "Artist token already exists");
        require(symbolToToken[symbol] == address(0), "Symbol already taken");
        
        // Deploy new token
        ArtistToken newToken = new ArtistToken(
            name,
            symbol,
            totalSupply
        );
        
        // Store token information
        address tokenAddress = address(newToken);
        isArtistToken[tokenAddress] = true;
        artistToToken[name] = tokenAddress;
        symbolToToken[symbol] = tokenAddress;
        allTokens.push(tokenAddress);
        
        // Emit event
        emit TokenCreated(
            tokenAddress,
            name,
            symbol,
            totalSupply,
            msg.sender
        );
        
        return tokenAddress;
    }
    
    // View functions
    function getAllTokens() public view returns (address[] memory) {
        return allTokens;
    }
    
    function getTokenCount() public view returns (uint256) {
        return allTokens.length;
    }
    
    function getTokenByArtist(string memory name) public view returns (address) {
        return artistToToken[name];
    }
    
    function getTokenBySymbol(string memory symbol) public view returns (address) {
        return symbolToToken[symbol];
    }
    
    // Validate if address is a token created by this factory
    function isTokenFromFactory(address tokenAddress) public view returns (bool) {
        return isArtistToken[tokenAddress];
    }
}