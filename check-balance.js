// check-balance.js
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Contract address
  const CONTRACT_ADDRESS = '0xf1d498e69Be4ee79f767aeCCc7680A33e5B020C8';
  
  // Contract ABI - just the function we need
  const CONTRACT_ABI = [
    "function getContractBalance() external view returns (uint256)"
  ];
  
  // Connect to the network
  const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_TESTNET_URL);
  
  // Connect to the contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  
  // Check contract balance
  try {
    const balance = await contract.getContractBalance();
    console.log(`Contract balance: ${ethers.formatEther(balance)} tokens`);
    
    // Also check your wallet balance
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const walletBalance = await provider.getBalance(wallet.address);
    console.log(`Your wallet balance: ${ethers.formatEther(walletBalance)} tokens`);
  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
