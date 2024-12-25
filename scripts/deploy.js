const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    // Get the contract factories
    const ArtistTokenFactory = await hre.ethers.getContractFactory("ArtistTokenFactory");
    const ArtistTokenExchange = await hre.ethers.getContractFactory("ArtistTokenExchange");

    // Deploy Factory
    console.log("Deploying ArtistTokenFactory...");
    const factory = await ArtistTokenFactory.deploy();
    await factory.waitForDeployment();
    console.log("ArtistTokenFactory deployed to:", await factory.getAddress());

    // Deploy Exchange with Factory address
    console.log("Deploying ArtistTokenExchange...");
    const exchange = await ArtistTokenExchange.deploy(await factory.getAddress());
    await exchange.waitForDeployment();
    console.log("ArtistTokenExchange deployed to:", await exchange.getAddress());

    //Create a test token
    console.log("Creating test token...");
    const createTokenTx = await factory.createToken(
        "Drake Token",
        "DRAK",
        hre.ethers.parseEther("1000000")  // 1 million tokens
    );
    await createTokenTx.wait();
    
    console.log("Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });