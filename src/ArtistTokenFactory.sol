// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ArtistToken.sol";

contract ArtistTokenFactory {
    mapping(address => bool) public isArtistToken;
    mapping(string => address) public artistToToken;
    mapping(string => address) public symbolToToken;
    address[] public allTokens;

    event TokenCreated(address indexed tokenAddress, string name, string symbol, uint256 totalSupply, address creator);

    function createToken(string memory name, string memory symbol, uint256 totalSupply) public returns (address) {
        require(artistToToken[name] == address(0), "Artist token already exists");
        require(symbolToToken[symbol] == address(0), "Symbol already taken");

        // Deploy new token with msg.sender as owner
        ArtistToken newToken = new ArtistToken(
            name,
            symbol,
            totalSupply,
            msg.sender // Pass msg.sender as the token owner
        );

        address tokenAddress = address(newToken);

        isArtistToken[tokenAddress] = true;
        artistToToken[name] = tokenAddress;
        symbolToToken[symbol] = tokenAddress;
        allTokens.push(tokenAddress);

        emit TokenCreated(tokenAddress, name, symbol, totalSupply, msg.sender);

        return tokenAddress;
    }

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

    function isTokenFromFactory(address tokenAddress) public view returns (bool) {
        return isArtistToken[tokenAddress];
    }
}
