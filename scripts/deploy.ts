const hre = require("hardhat");

async function main() {
  const ArtistShares = await hre.ethers.getContractFactory("ArtistShares");
  const artistShares = await ArtistShares.deploy();
  await artistShares.waitForDeployment();

  console.log("ArtistShares deployed to:", await artistShares.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });