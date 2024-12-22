// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ArtistTokenFactory.sol";

contract ArtistTokenExchange is ReentrancyGuard {
    // State variables
    ArtistTokenFactory public factory;
    mapping(address => uint256) public tokenLiquidity;  // token -> token amount
    mapping(address => uint256) public ethLiquidity;    // token -> ETH amount
    
    // Constants
    uint256 public constant FEE_NUMERATOR = 3;
    uint256 public constant FEE_DENOMINATOR = 1000;  // 0.3% fee
    
    // Events
    event LiquidityAdded(address indexed token, uint256 tokenAmount, uint256 ethAmount, address provider);
    event LiquidityRemoved(address indexed token, uint256 tokenAmount, uint256 ethAmount, address provider);
    event TokensPurchased(address indexed token, uint256 tokenAmount, uint256 ethAmount, address buyer);
    event TokensSold(address indexed token, uint256 tokenAmount, uint256 ethAmount, address seller);
    
    constructor(address factoryAddress) {
        factory = ArtistTokenFactory(factoryAddress);
    }
    
    // Add liquidity
    function addLiquidity(address tokenAddress) external payable nonReentrant {
        require(factory.isTokenFromFactory(tokenAddress), "Token not from factory");
        IERC20 token = IERC20(tokenAddress);
        
        uint256 tokenAmount;
        if (tokenLiquidity[tokenAddress] == 0) {
            // First time adding liquidity
            tokenAmount = msg.value * 1000; // Initial rate: 1 ETH = 1000 tokens
        } else {
            // Match existing ratio
            tokenAmount = (msg.value * tokenLiquidity[tokenAddress]) / ethLiquidity[tokenAddress];
        }
        
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        
        tokenLiquidity[tokenAddress] += tokenAmount;
        ethLiquidity[tokenAddress] += msg.value;
        
        emit LiquidityAdded(tokenAddress, tokenAmount, msg.value, msg.sender);
    }
    
    // Calculate price for buying tokens
    function getTokenPurchaseAmount(address tokenAddress, uint256 ethAmount) public view returns (uint256) {
        require(ethLiquidity[tokenAddress] > 0, "No liquidity");
        
        uint256 inputWithFee = ethAmount * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = inputWithFee * tokenLiquidity[tokenAddress];
        uint256 denominator = (ethLiquidity[tokenAddress] * FEE_DENOMINATOR) + inputWithFee;
        
        return numerator / denominator;
    }
    
    // Buy tokens with ETH
    function buyTokens(address tokenAddress, uint256 minTokens) external payable nonReentrant {
        require(factory.isTokenFromFactory(tokenAddress), "Token not from factory");
        
        uint256 tokenAmount = getTokenPurchaseAmount(tokenAddress, msg.value);
        require(tokenAmount >= minTokens, "Insufficient output amount");
        
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        
        tokenLiquidity[tokenAddress] -= tokenAmount;
        ethLiquidity[tokenAddress] += msg.value;
        
        emit TokensPurchased(tokenAddress, tokenAmount, msg.value, msg.sender);
    }
    
    // Calculate price for selling tokens
    function getEthPurchaseAmount(address tokenAddress, uint256 tokenAmount) public view returns (uint256) {
        require(tokenLiquidity[tokenAddress] > 0, "No liquidity");
        
        uint256 inputWithFee = tokenAmount * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = inputWithFee * ethLiquidity[tokenAddress];
        uint256 denominator = (tokenLiquidity[tokenAddress] * FEE_DENOMINATOR) + inputWithFee;
        
        return numerator / denominator;
    }
    
    // Sell tokens for ETH
    function sellTokens(address tokenAddress, uint256 tokenAmount, uint256 minEth) external nonReentrant {
        require(factory.isTokenFromFactory(tokenAddress), "Token not from factory");
        
        uint256 ethAmount = getEthPurchaseAmount(tokenAddress, tokenAmount);
        require(ethAmount >= minEth, "Insufficient output amount");
        
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount), "Transfer failed");
        
        payable(msg.sender).transfer(ethAmount);
        
        tokenLiquidity[tokenAddress] += tokenAmount;
        ethLiquidity[tokenAddress] -= ethAmount;
        
        emit TokensSold(tokenAddress, tokenAmount, ethAmount, msg.sender);
    }
    
    // View functions
    function getLiquidity(address tokenAddress) external view returns (uint256 tokenAmount, uint256 ethAmount) {
        return (tokenLiquidity[tokenAddress], ethLiquidity[tokenAddress]);
    }
    
    function getPrice(address tokenAddress) external view returns (uint256) {
        require(tokenLiquidity[tokenAddress] > 0, "No liquidity");
        return (ethLiquidity[tokenAddress] * 1e18) / tokenLiquidity[tokenAddress];
    }
}