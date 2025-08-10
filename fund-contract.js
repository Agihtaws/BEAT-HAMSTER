// fund-contract.js
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Get amount from command line arguments
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.log('Usage: node fund-contract.js <amount>');
    console.log('Example: node fund-contract.js 0.1');
    process.exit(1);
  }
  
  const amount = args[0];
  const amountInWei = ethers.parseEther(amount);
  
  // Contract address
  const CONTRACT_ADDRESS = '0xf1d498e69Be4ee79f767aeCCc7680A33e5B020C8';
  
  // Connect to the network
  const provider = new ethers.JsonRpcProvider(process.env.SOMNIA_TESTNET_URL);
  
  // Load the wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`Funding from: ${wallet.address}`);
  
  // Send transaction
  console.log(`Funding contract with ${amount} tokens...`);
  
  try {
    const tx = await wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: amountInWei,
      gasLimit: 100000
    });
    
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    await tx.wait();
    console.log('Funding successful!');
    
    // Check wallet balance
    const walletBalance = await provider.getBalance(wallet.address);
    console.log(`Remaining wallet balance: ${ethers.formatEther(walletBalance)} tokens`);
  } catch (error) {
    console.error('Error funding contract:', error);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
