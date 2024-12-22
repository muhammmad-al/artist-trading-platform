// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArtistToken is ERC20 {
    // State variables
    uint256 private _totalSupply;
    address public owner;
    
    // Events
    event TokensDeployed(string name, string symbol, uint256 totalSupply);
    
    // Constructor
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_
    ) ERC20(name_, symbol_) {
        require(totalSupply_ > 0, "Total supply must be greater than 0");
        owner = msg.sender;
        _totalSupply = totalSupply_;
        
        // Mint all tokens to deployer
        _mint(msg.sender, totalSupply_ * (10 ** decimals()));
        
        emit TokensDeployed(name_, symbol_, totalSupply_);
    }
    
    // View functions
    function getOwner() public view returns (address) {
        return owner;
    }
    
    // Transfer functions are inherited from OpenZeppelin's ERC20:
    // - transfer(address to, uint256 amount)
    // - transferFrom(address from, address to, uint256 amount)
    // - approve(address spender, uint256 amount)
    
    // Additional helper function to get token info
    function getTokenInfo() public view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address tokenOwner
    ) {
        return (
            name(),
            symbol(),
            totalSupply(),
            owner
        );
    }
}