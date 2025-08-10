
# 🐹 BEAT HAMSTER

![Beat Hamster Game](https://beat-hamster.vercel.app/preview.png)

A fun, blockchain-integrated whack-a-mole style game where players earn bonus points by hitting hamsters and can redeem these points for **Somnia Testnet tokens**.

## 🎮 [Live Demo](https://beat-hamster.vercel.app/)

## 🎥 Demo Video

[![Watch the video](https://img.youtube.com/vi/xhVU1DT6rJQ/0.jpg)](https://www.youtube.com/watch?v=xhVU1DT6rJQ)

---

## ✨ Features

- **Blockchain Integration**: Game results permanently recorded on the Somnia Testnet  
- **Bonus Points System**: Earn 1 bonus point for every 10 game points  
- **Token Rewards**: Redeem bonus points for Somnia testnet tokens  
- **Persistent Wallet Connection**: Stays connected for 15 days of inactivity  
- **Global Leaderboard**: Track your performance against other players  
- **Best Score Tracking**: Your highest score is saved on the blockchain  
- **Responsive Design**: Play on desktop or mobile devices  
- **Engaging Animations**: Fun hamster animations and sound effects  

---

## 🛠️ Tech Stack

- **Smart Contract**: Solidity 0.8.19  
- **Blockchain**: Somnia Testnet  
- **Frontend**: React.js  
- **Web3 Integration**: ethers.js  
- **Styling**: CSS with responsive design  
- **Wallet Connection**: MetaMask integration  

---

## 🏆 Game Features

### 🎯 Gameplay
- Click on hamsters as they appear to earn points  
- Every **10 points = 1 bonus point**  
- Game lasts **60 seconds**  
- Try to achieve the highest score possible  

### 💰 Reward System
- Collect **10 bonus points** to redeem for Somnia testnet tokens  
- Best scores recorded on the blockchain  
- Compete on the **global leaderboard**  

---

## 📂 Project Structure

```

beat-hamster/
├── contracts/
│   └── BeatHamster.sol       # Main smart contract
├── scripts/
│   └── deploy.js             # Deployment script
├── check-balance.js          # Check contract balance
├── fund-contract.js          # Fund contract with tokens
├── monitor-contract.js       # Monitor and auto-fund contract
├── beat-hamster-frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── GameBoard.js         # Game board component
│       │   ├── GameOver.js          # Game over component
│       │   ├── Hamster.js           # Hamster component
│       │   ├── Leaderboard.js       # Leaderboard component
│       │   └── WalletConnect.js     # Wallet connection component
│       ├── contracts/
│       │   └── BeatHamsterABI.js    # Contract ABI
│       ├── utils/
│       │   └── gameUtils.js         # Game utility functions
│       ├── App.css                  # Main application styles
│       └── App.js                   # Main application component
└── hardhat.config.js                # Hardhat configuration

````

---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js (v14.0.0 or higher)  
- npm (v6.0.0 or higher)  
- MetaMask extension installed  
- Somnia Testnet tokens (for contract deployment)  

---

### 1️⃣ Smart Contract Deployment

```bash
# Clone the repository
git clone https://github.com/Agihtaws/BEAT-HAMSTER.git
cd BEAT-HAMSTER

# Install dependencies
npm install
````

**Create a `.env` file** in the root directory:

```
PRIVATE_KEY=your_wallet_private_key
SOMNIA_TESTNET_URL=https://rpc.ankr.com/somnia_testnet
```

**Compile & deploy:**

```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network somnia_testnet
```

**Note:** Save the deployed contract address for frontend configuration.

---

### 📜 Contract Management Scripts

**Check contract balance:**

```bash
node check-balance.js
```

**Fund contract with tokens:**

```bash
node fund-contract.js <amount>
# Example:
node fund-contract.js 0.1
```

**Automatic contract funding monitoring:**

```bash
node monitor-contract.js
```

The monitor script will automatically fund the contract when the balance falls below the minimum threshold.

---

### 2️⃣ Frontend Setup

```bash
cd beat-hamster-frontend
npm install
```

**Update contract address** in:

```
src/contracts/BeatHamsterABI.js
```

**Run locally:**

```bash
npm start
```

**Build for production:**

```bash
npm run build
```

---

## 🪙 Getting Somnia Testnet Tokens

* Visit the [Somnia Testnet Faucet](https://testnet.somnia.network/)
* Join the [Somnia Discord](https://discord.gg/somnia) for support

---

## 🎮 How to Play

1. Connect your MetaMask wallet to Somnia Testnet
2. Click on hamsters to earn points
3. Game duration is 60 seconds
4. Score is automatically recorded on the blockchain
5. Earn bonus points → Redeem for Somnia testnet tokens

**Try now:** [Live Demo](https://beat-hamster.vercel.app/) 🎯

---

## 🔗 Smart Contract

Deployed at:

```
0xf1d498e69Be4ee79f767aeCCc7680A33e5B020C8
```

### 📜 Key Functions

* `submitScore(uint256 score)` → Record a game score
* `redeemTokens()` → Redeem bonus points for tokens
* `getPlayerBestScore(address player)` → Get player's best score
* `getPlayerBonusPoints(address player)` → Get player's bonus points
* `getTopScores(uint256 count)` → Get top leaderboard scores

---

## 🚧 Future Enhancements

* Multiplayer real-time mode
* Different difficulty levels
* NFT hamster characters
* Tournament system
* Mobile app version

---

## 📄 License

Apache License — see [LICENSE](LICENSE) file.

---

## 👥 Contributors

* **Swathiga Agihtaws** — Developer

---

## 🙏 Acknowledgements

* [ethers.js](https://docs.ethers.io/) — Blockchain interaction
* [Somnia Testnet](https://somnia.network) — Testnet hosting
* [React.js](https://reactjs.org/) — Frontend framework


