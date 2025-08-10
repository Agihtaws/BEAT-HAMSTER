// monitor-contract.js
const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const CONTRACT_ADDRESS = '0xf1d498e69Be4ee79f767aeCCc7680A33e5B020C8';
const MIN_BALANCE = ethers.parseEther('0.05'); // 0.05 tokens
const FUNDING_AMOUNT = ethers.parseEther('0.1'); // 0.1 tokens
const CHECK_INTERVAL = 60000; // 60 seconds

// Contract ABI - just the functions we need
const CONTRACT_ABI = [
  "function getContractBalance() external view returns (uint256)"
];

async function main() {
  // Connect to the network
  const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_TESTNET_URL);
  
  // Load the wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`Monitoring contract as: ${wallet.address}`);
  
  // Connect to the contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  
  // Check balance immediately
  await checkAndFund(contract, wallet);
  
  // Set up polling instead of event listeners
  console.log(`Monitoring started. Checking every ${CHECK_INTERVAL / 1000} seconds...`);
  console.log('Press Ctrl+C to stop monitoring.');
  
  // Check periodically
  setInterval(async () => {
    await checkAndFund(contract, wallet);
  }, CHECK_INTERVAL);
}

async function checkAndFund(contract, wallet) {
  try {
    const balance = await contract.getContractBalance();
    console.log(`Current contract balance: ${ethers.formatEther(balance)} tokens`);
    
    if (balance < MIN_BALANCE) {
      console.log(`Balance below minimum threshold of ${ethers.formatEther(MIN_BALANCE)} tokens.`);
      await fundContract(wallet);
    }
  } catch (error) {
    console.error('Error checking contract balance:', error);
  }
}

async function fundContract(wallet) {
  try {
    console.log(`Funding contract with ${ethers.formatEther(FUNDING_AMOUNT)} tokens...`);
    
    const tx = await wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: FUNDING_AMOUNT,
      gasLimit: 100000
    });
    
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    await tx.wait();
    console.log('Funding successful!');
    
    // Check wallet balance after funding
    const walletBalance = await wallet.provider.getBalance(wallet.address);
    console.log(`Remaining wallet balance: ${ethers.formatEther(walletBalance)} tokens`);
  } catch (error) {
    console.error('Error funding contract:', error);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

