const hre = require("hardhat");

async function main() {
    // Get contract instances
    const factory = await hre.ethers.getContractAt(
        "ArtistTokenFactory",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    const exchange = await hre.ethers.getContractAt(
        "ArtistTokenExchange",
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    );

    // Get signers (accounts)
    const [owner, user1, user2] = await hre.ethers.getSigners();

    console.log("\nCreating new token...");
    // Create new token
    const createTx = await factory.createToken(
        "Travis Token",
        "TRAV",
        hre.ethers.parseEther("1000000")
    );
    await createTx.wait();

    // Get token address and contract
    const tokenAddress = await factory.getTokenBySymbol("TRAV");
    const token = await hre.ethers.getContractAt("ArtistToken", tokenAddress);
    console.log("Token created at:", tokenAddress);

    console.log("\nSetting up liquidity...");
    // Approve exchange to spend tokens
    const approveTx = await token.approve(
        await exchange.getAddress(),
        hre.ethers.parseEther("100000")
    );
    await approveTx.wait();

    // Add liquidity (1 ETH = 1000 tokens initially)
    const addLiquidityTx = await exchange.addLiquidity(tokenAddress, {
        value: hre.ethers.parseEther("1")
    });
    await addLiquidityTx.wait();

    // Get liquidity info
    const [tokenLiq, ethLiq] = await exchange.getLiquidity(tokenAddress);
    console.log("Liquidity added:");
    console.log("- Token liquidity:", hre.ethers.formatEther(tokenLiq), "TRAV");
    console.log("- ETH liquidity:", hre.ethers.formatEther(ethLiq), "ETH");

    console.log("\nTesting trades...");
    // User1 buys tokens
    const buyTx = await exchange.connect(user1).buyTokens(
        tokenAddress,
        0, // min tokens
        { value: hre.ethers.parseEther("0.1") }
    );
    await buyTx.wait();

    // Check user1's token balance
    const user1Balance = await token.balanceOf(user1.address);
    console.log("User1 token balance:", hre.ethers.formatEther(user1Balance), "TRAV");

    // User1 approves and sells half their tokens
    const sellAmount = user1Balance / BigInt(2);
    await token.connect(user1).approve(await exchange.getAddress(), sellAmount);
    
    const sellTx = await exchange.connect(user1).sellTokens(
        tokenAddress,
        sellAmount,
        0 // min ETH
    );
    await sellTx.wait();

    // Check updated balance
    const updatedBalance = await token.balanceOf(user1.address);
    console.log("User1 token balance after selling half:", hre.ethers.formatEther(updatedBalance), "TRAV");

    // Get current price
    const price = await exchange.getPrice(tokenAddress);
    console.log("\nCurrent token price:", hre.ethers.formatEther(price), "ETH per token");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });