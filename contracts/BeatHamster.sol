// contracts/BeatHamster.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BeatHamster {
    // Game score structure
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    // Leaderboard storage
    Score[] public leaderboard;
    mapping(address => uint256) public playerBestScore;
    
    // Bonus points system
    mapping(address => uint256) public playerBonusPoints;
    uint256 public bonusPointsRate = 10; // Players earn 1 bonus point per 10 game points
    uint256 public tokenExchangeRate = 10; // 10 bonus points = 1 testnet token
    address public owner;
    
    // Auto-funding variables
    uint256 public minContractBalance = 0.1 ether; // Minimum balance to maintain
    address public funder; // Address that will automatically fund the contract
    bool public autoFundingEnabled = false;
    
    // Events
    event NewScore(address indexed player, uint256 score, uint256 timestamp);
    event BonusPointsEarned(address indexed player, uint256 points);
    event TokensRedeemed(address indexed player, uint256 amount);
    event ContractFunded(address indexed funder, uint256 amount);
    event FundingNeeded(uint256 currentBalance);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Submit a new score to the leaderboard
    function submitScore(uint256 score) external {
        // Update player's best score if this is higher
        if (score > playerBestScore[msg.sender]) {
            playerBestScore[msg.sender] = score;
        }
        
        // Calculate and award bonus points
        uint256 bonusPoints = score / bonusPointsRate;
        if (bonusPoints > 0) {
            playerBonusPoints[msg.sender] += bonusPoints;
            emit BonusPointsEarned(msg.sender, bonusPoints);
        }
        
        // Add to leaderboard
        leaderboard.push(Score({
            player: msg.sender,
            score: score,
            timestamp: block.timestamp
        }));
        
        // Sort the new entry into the leaderboard (simple insertion sort)
        for (uint256 i = leaderboard.length - 1; i > 0; i--) {
            if (leaderboard[i].score > leaderboard[i-1].score) {
                Score memory temp = leaderboard[i-1];
                leaderboard[i-1] = leaderboard[i];
                leaderboard[i] = temp;
            } else {
                break;
            }
        }
        
        // Keep leaderboard size manageable (max 100 entries)
        if (leaderboard.length > 100) {
            // Remove the lowest score
            leaderboard.pop();
        }
        
        emit NewScore(msg.sender, score, block.timestamp);
    }
    
    // Redeem bonus points for testnet tokens
    function redeemTokens() external {
        uint256 bonusPoints = playerBonusPoints[msg.sender];
        require(bonusPoints >= tokenExchangeRate, "Not enough bonus points");
        
        uint256 tokensToRedeem = bonusPoints / tokenExchangeRate;
        uint256 pointsUsed = tokensToRedeem * tokenExchangeRate;
        
        // Deduct used points
        playerBonusPoints[msg.sender] -= pointsUsed;
        
        // Check contract balance before transfer
        uint256 contractBalance = address(this).balance;
        uint256 redeemAmount = tokensToRedeem * 1e16; // 0.01 tokens per redemption
        require(contractBalance >= redeemAmount, "Insufficient contract balance");
        
        // Check if balance will be too low after redemption and request funding if needed
        if (autoFundingEnabled && contractBalance - redeemAmount < minContractBalance) {
            emit FundingNeeded(contractBalance - redeemAmount);
        }
        
        // Transfer tokens to the player
        (bool success, ) = payable(msg.sender).call{value: redeemAmount}("");
        require(success, "Token transfer failed");
        
        emit TokensRedeemed(msg.sender, tokensToRedeem);
    }
    
    // Setup auto-funding
    function setupAutoFunding(address _funder, uint256 _minBalance) external {
        require(msg.sender == owner, "Only owner can set up auto-funding");
        funder = _funder;
        minContractBalance = _minBalance;
        autoFundingEnabled = true;
    }
    
    // Toggle auto-funding
    function toggleAutoFunding(bool enabled) external {
        require(msg.sender == owner, "Only owner can toggle auto-funding");
        autoFundingEnabled = enabled;
    }
    
    // Fund the contract with testnet tokens
    function fundContract() external payable {
        require(msg.value > 0, "Must send some value");
        emit ContractFunded(msg.sender, msg.value);
    }
    
    // Get the top N scores from the leaderboard
    function getTopScores(uint256 count) external view returns (Score[] memory) {
        uint256 resultCount = count < leaderboard.length ? count : leaderboard.length;
        Score[] memory results = new Score[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            results[i] = leaderboard[i];
        }
        
        return results;
    }
    
    // Get a player's best score
    function getPlayerBestScore(address player) external view returns (uint256) {
        return playerBestScore[player];
    }
    
    // Get a player's bonus points
    function getPlayerBonusPoints(address player) external view returns (uint256) {
        return playerBonusPoints[player];
    }
    
    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Fallback function - called when no other function matches
    fallback() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }
    
    // Receive function - called when contract receives Ether with empty calldata
    receive() external payable {
        emit ContractFunded(msg.sender, msg.value);
    }
    
    // Emergency withdrawal function (only owner)
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}

