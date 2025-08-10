// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying BeatHamster contract...");
  
  // Deploy the BeatHamster contract
  const BeatHamster = await ethers.getContractFactory("BeatHamster");
  const beatHamster = await BeatHamster.deploy();
  
  await beatHamster.waitForDeployment();
  const beatHamsterAddress = await beatHamster.getAddress();
  
  console.log(`BeatHamster deployed to: ${beatHamsterAddress}`);
  
  // Fund the contract with initial testnet tokens
  const [deployer] = await ethers.getSigners();
  const fundAmount = ethers.parseEther("0.2"); // Fund with 0.2 testnet tokens
  
  console.log(`Funding contract with ${ethers.formatEther(fundAmount)} testnet tokens...`);
  await deployer.sendTransaction({
    to: beatHamsterAddress,
    value: fundAmount,
    gasLimit: 100000
  });
  
  // Set up auto-funding with deployer as the funder
  console.log("Setting up auto-funding...");
  await beatHamster.setupAutoFunding(
    deployer.address,
    ethers.parseEther("0.05") // Minimum balance of 0.05 tokens
  );
  
  console.log("Deployment and setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

