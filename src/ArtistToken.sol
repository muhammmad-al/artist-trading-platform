// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArtistToken is ERC20 {
    address public owner;

    constructor(string memory name_, string memory symbol_, uint256 totalSupply_, address tokenOwner)
        ERC20(name_, symbol_)
    {
        require(totalSupply_ > 0, "Total supply must be greater than 0");
        require(tokenOwner != address(0), "Invalid owner address");

        owner = tokenOwner;
        _mint(tokenOwner, totalSupply_);
    }

    function getTokenInfo()
        public
        view
        returns (string memory tokenName, string memory tokenSymbol, uint256 tokenSupply, address tokenOwner)
    {
        return (name(), symbol(), totalSupply(), owner);
    }
}
