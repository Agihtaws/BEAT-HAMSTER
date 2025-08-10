import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contracts/BeatHamsterABI';
import './App.css';

function App() {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [leaderboard, setLeaderboard] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [activeHamster, setActiveHamster] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bonusPointsEarned, setBonusPointsEarned] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreBump, setScoreBump] = useState(false);
  
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  
  // Refs
  const scoreDisplayRef = useRef(null);
  const timeDisplayRef = useRef(null);
  
  // Sound effects function
  const playSound = (soundName) => {
    const sound = new Audio(`/sounds/${soundName}.mp3`);
    sound.play().catch(e => console.log("Audio play error:", e));
  };
  
  // Check for stored wallet connection on load
  useEffect(() => {
    const checkStoredWallet = async () => {
      try {
        const storedWalletData = localStorage.getItem('walletConnection');
        
        if (storedWalletData) {
          const walletData = JSON.parse(storedWalletData);
          const currentTime = new Date().getTime();
          
          // Check if wallet connection is still valid (within 15 days)
          if (currentTime - walletData.timestamp < 15 * 24 * 60 * 60 * 1000) {
            // Connection is still valid, auto-connect
            if (window.ethereum) {
              // Update the timestamp to show this is an active session
              updateWalletTimestamp(walletData.account);
              
              // Attempt to reconnect with the stored account
              const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts'
              });
              
              if (accounts.includes(walletData.account)) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                
                setAccount(walletData.account);
                setProvider(provider);
                setContract(contract);
                setWalletConnected(true);
                
                // Get player data
                await fetchPlayerData(walletData.account, contract);
                await fetchLeaderboard(contract);
              } else {
                // Account changed, clear stored connection
                localStorage.removeItem('walletConnection');
              }
            }
          } else {
            // Connection expired, remove from storage
            localStorage.removeItem('walletConnection');
          }
        }
      } catch (error) {
        console.error("Error checking stored wallet:", error);
        // If any error, clear the stored wallet data
        localStorage.removeItem('walletConnection');
      }
    };
    
    checkStoredWallet();
  }, []);
  
  // Update wallet timestamp when app is used
  const updateWalletTimestamp = (accountAddress) => {
    try {
      const walletData = {
        account: accountAddress,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('walletConnection', JSON.stringify(walletData));
    } catch (error) {
      console.error("Error updating wallet timestamp:", error);
    }
  };
  
  // Initialize app and fetch leaderboard even without wallet connection
  useEffect(() => {
    const initApp = async () => {
      try {
        // Create a read-only provider and contract instance
        const readProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet");
        const readContract = new ethers.Contract(contractAddress, contractABI, readProvider);
        
        // Fetch leaderboard without requiring wallet connection
        await fetchLeaderboard(readContract);
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
    
    initApp();
  }, []);
  
  // Process leaderboard to remove duplicates and add play count
  const processLeaderboard = (rawLeaderboard) => {
    const playerMap = new Map();
    
    // Group by player address and keep highest score
    rawLeaderboard.forEach(entry => {
      const player = entry.player;
      if (!playerMap.has(player) || playerMap.get(player).score < entry.score) {
        playerMap.set(player, { 
          ...entry,
          playCount: playerMap.has(player) ? playerMap.get(player).playCount + 1 : 1
        });
      } else {
        const existing = playerMap.get(player);
        playerMap.set(player, {
          ...existing,
          playCount: existing.playCount + 1
        });
      }
    });
    
    // Convert map back to array and sort by score
    return Array.from(playerMap.values())
      .sort((a, b) => b.score - a.score);
  };
  
  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        setAccount(accounts[0]);
        setProvider(provider);
        setContract(contract);
        setWalletConnected(true);
        
        // Store wallet connection with timestamp
        updateWalletTimestamp(accounts[0]);
        
        // Get player data
        await fetchPlayerData(accounts[0], contract);
        await fetchLeaderboard(contract);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      } else {
        alert("Please install MetaMask to play!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  
  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWalletConnected(false);
      setAccount('');
      localStorage.removeItem('walletConnection');
    } else {
      // Account changed
      setAccount(accounts[0]);
      // Update stored wallet data with new account
      updateWalletTimestamp(accounts[0]);
      
      if (contract) {
        await fetchPlayerData(accounts[0], contract);
      }
    }
  };
  
  // Fetch player data
  const fetchPlayerData = async (address, contractInstance) => {
    try {
      const bestScore = await contractInstance.getPlayerBestScore(address);
      const bonusPoints = await contractInstance.getPlayerBonusPoints(address);
      
      setBestScore(Number(bestScore));
      setBonusPoints(Number(bonusPoints));
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  };
  
  // Fetch leaderboard
  const fetchLeaderboard = async (contractInstance) => {
    try {
      const topScores = await contractInstance.getTopScores(50);
      const formattedScores = topScores.map(entry => ({
        player: entry[0],
        score: Number(entry[1]),
        timestamp: Number(entry[2]),
        playCount: 1
      }));
      
      setLeaderboard(processLeaderboard(formattedScores));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };
  
  // Submit score (automatically at game end)
  const submitScore = async () => {
    if (!contract || score <= 0) return;
    
    try {
      setIsLoading(true);
      const tx = await contract.submitScore(score);
      await tx.wait();
      
      // Calculate bonus points earned
      const newBonusPoints = Math.floor(score/10);
      setBonusPointsEarned(newBonusPoints);
      
      // Update player data and leaderboard
      await fetchPlayerData(account, contract);
      await fetchLeaderboard(contract);
      
      // Update wallet timestamp on successful score submission
      updateWalletTimestamp(account);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error submitting score:", error);
      setIsLoading(false);
    }
  };
  
  // Redeem tokens
  const redeemTokens = async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      
      // Check contract balance first
      try {
        const contractBalance = await contract.getContractBalance();
        const redeemAmount = ethers.parseEther("0.01"); // 0.01 tokens per redemption
        
        if (contractBalance < redeemAmount) {
          alert("The game contract doesn't have enough tokens right now. Please try again later or contact the game admin.");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log("Couldn't check contract balance, proceeding with redemption anyway");
      }
      
      const tx = await contract.redeemTokens();
      await tx.wait();
      playSound('gameover');
      await fetchPlayerData(account, contract);
      
      // Update wallet timestamp on successful token redemption
      updateWalletTimestamp(account);
      
      setIsLoading(false);
      alert("Tokens redeemed successfully! Check your wallet balance.");
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      setIsLoading(false);
      
      // Show more user-friendly error message
      if (error.message && error.message.includes("Insufficient contract balance")) {
        alert("The game contract needs more funds. Please try again later or contact the game admin.");
      } else if (error.message && error.message.includes("Not enough bonus points")) {
        alert("You don't have enough bonus points yet. Keep playing to earn more!");
      } else {
        alert("Error redeeming tokens. Please try again later.");
      }
    }
  };
  
  // Start game
  const startGame = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    
    try {
      setIsLoading(true);
      setGameStarted(true);
      setGameActive(true);
      setGameOver(false);
      setScore(0);
      setTimeLeft(60);
      setActiveHamster(null);
      setBonusPointsEarned(0);
      
      // Update wallet timestamp when starting a game
      updateWalletTimestamp(account);
      
      setIsLoading(false);
      playSound('click');
    } catch (error) {
      console.error("Error starting game:", error);
      setIsLoading(false);
    }
  };
  
  // End game and submit score automatically
  const endGame = async () => {
    setGameActive(false);
    setGameOver(true);
    playSound('gameover');
    
    // Automatically submit score
    if (score > 0 && walletConnected) {
      await submitScore();
    }
  };
  
  // Toggle leaderboard visibility
  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
    
    // Update wallet timestamp when viewing leaderboard
    if (walletConnected) {
      updateWalletTimestamp(account);
    }
    
    playSound('click');
  };
  
  // Game timer
  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      
      // Add low time warning class when time is running out
      if (timeDisplayRef.current) {
        if (timeLeft <= 10) {
          timeDisplayRef.current.classList.add('time-low');
        } else {
          timeDisplayRef.current.classList.remove('time-low');
        }
      }
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);
  
  // Score bump animation
  useEffect(() => {
    if (scoreBump && scoreDisplayRef.current) {
      scoreDisplayRef.current.classList.add('score-bump');
      setTimeout(() => {
        if (scoreDisplayRef.current) {
          scoreDisplayRef.current.classList.remove('score-bump');
        }
        setScoreBump(false);
      }, 300);
    }
  }, [scoreBump]);
  
  // Hamster appearance logic - improved to be more responsive
  useEffect(() => {
    if (!gameActive) return;
    
    let hamsterTimer;
    let initialDelay;
    
    const showNewHamster = () => {
      if (gameActive) {
        // Show a new hamster in a random position
        const newPosition = Math.floor(Math.random() * 16);
        setActiveHamster(newPosition);
        
        // Hide after a random time between 1-2 seconds
        const hideTime = 1000 + Math.random() * 1000;
        hamsterTimer = setTimeout(() => {
          setActiveHamster(null);
          
          // Schedule next hamster after a short delay
          initialDelay = setTimeout(showNewHamster, 300 + Math.random() * 500);
        }, hideTime);
      }
    };
    
    // Start the cycle
    initialDelay = setTimeout(showNewHamster, 500);
    
    return () => {
      clearTimeout(hamsterTimer);
      clearTimeout(initialDelay);
    };
  }, [gameActive]);
  
  // Handle hamster click with improved detection and hit effect
  const hitHamster = (position) => {
    if (position === activeHamster) {
      // Increment score
      setScore(prevScore => prevScore + 1);
      setScoreBump(true);
      setActiveHamster(null);
      playSound('pop');
      
      // Create hit effect
      const cell = document.querySelectorAll('.grid-cell')[position];
      if (cell) {
        const hitEffect = document.createElement('div');
        hitEffect.className = 'hit-effect';
        cell.appendChild(hitEffect);
        
        // Remove hit effect after animation completes
        setTimeout(() => {
          if (hitEffect.parentNode === cell) {
            cell.removeChild(hitEffect);
          }
        }, 500);
      }
      
      // Immediately show a new hamster
      setTimeout(() => {
        if (gameActive) {
          const newPosition = Math.floor(Math.random() * 16);
          setActiveHamster(newPosition);
        }
      }, 200);
    }
  };
  
  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameActive(false);
    setGameOver(false);
    
    // Update wallet timestamp when returning to home screen
    if (walletConnected) {
      updateWalletTimestamp(account);
    }
    
    playSound('click');
  };
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);
  
  return (
    <div className="App">
      {!gameStarted ? (
        // Home screen with compact layout
        <div className="home-screen">
          <div className="home-content">
            <h1 className="game-title">Beat Hamster</h1>
            
            
            <div className="game-instructions">
              <h2>How to Play</h2>
              <p>Click on hamsters as they appear to earn points.</p>
              <p>Each 10 points earns you 1 bonus point.</p>
              <p>Collect 10 bonus points to redeem for Somnia testnet tokens!</p>
              
              {!walletConnected ? (
              <button onClick={connectWallet} className="connect-button">
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <p>Connected: {account.substring(0, 6)}...{account.substring(38)}</p>
                <p>Best Score: {bestScore}</p>
                <p>Bonus Points: {bonusPoints}</p>
                <div className="button-group">
                  {bonusPoints >= 10 && (
                    <button 
                      onClick={redeemTokens} 
                      className="redeem-button"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>Processing... <span className="loading"></span></>
                      ) : (
                        'Redeem Tokens'
                      )}
                    </button>
                  )}
                  <button 
                    onClick={startGame} 
                    className="start-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Starting... <span className="loading"></span></>
                    ) : (
                      'Start Game'
                    )}
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
          
          {/* Modal Leaderboard */}
          {showLeaderboard && (
            <div className="modal-overlay" onClick={toggleLeaderboard}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Leaderboard</h2>
                  <button className="close-button" onClick={toggleLeaderboard}>×</button>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="no-scores">No scores yet. Be the first to play!</p>
                ) : (
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr key={index} className={entry.player === account ? 'my-score' : ''}>
                          <td>{index + 1}</td>
                          <td>{`${entry.player.substring(0, 6)}...${entry.player.substring(38)}`}</td>
                          <td>{entry.score}</td>
                          <td>{entry.playCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Game screen - optimized for no scrolling
        <div className="game-screen">
          <div className="game-header">
            <div ref={scoreDisplayRef} className="score-display">Score: {score}</div>
            <div ref={timeDisplayRef} className="time-display">Time: {timeLeft}s</div>
          </div>
          
          <div className={`game-grid ${gameOver ? 'blurred' : ''}`}>
            {Array(16).fill(null).map((_, index) => (
              <div 
                key={index} 
                className={`grid-cell ${activeHamster === index ? 'active' : ''}`}
                onClick={() => gameActive && hitHamster(index)}
              >
                {activeHamster === index && (
                  <div className="hamster">
                    <div className="hamster-ears">
                      <div className="ear left"></div>
                      <div className="ear right"></div>
                    </div>
                    <div className="hamster-face">
                      <div className="eye left"></div>
                      <div className="eye right"></div>
                      <div className="nose"></div>
                      <div className="whiskers">
                        <div className="whisker left-top"></div>
                        <div className="whisker left-bottom"></div>
                        <div className="whisker right-top"></div>
                        <div className="whisker right-bottom"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {gameOver && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>Game Over!</h2>
                <p className="final-score">Your Score: {score}</p>
                <p className="bonus-points">Bonus Points Earned: {Math.floor(score/10)}</p>
                {walletConnected && (
                  <p className="total-bonus">Total Bonus Points: {bonusPoints}</p>
                )}
                {isLoading ? (
                  <p className="submitting">
                    Submitting score... <span className="loading"></span>
                  </p>
                ) : (
                  <div className="game-over-buttons">
                    <button onClick={resetGame} className="back-button">
                      Back to Home
                    </button>
                    <button onClick={toggleLeaderboard} className="leaderboard-button">
                      View Leaderboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Modal Leaderboard (also available in game screen) */}
          {showLeaderboard && (
            <div className="modal-overlay" onClick={toggleLeaderboard}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Leaderboard</h2>
                  <button className="close-button" onClick={toggleLeaderboard}>×</button>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="no-scores">No scores yet. Be the first to play!</p>
                ) : (
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Games</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr key={index} className={entry.player === account ? 'my-score' : ''}>
                          <td>{index + 1}</td>
                          <td>{`${entry.player.substring(0, 6)}...${entry.player.substring(38)}`}</td>
                          <td>{entry.score}</td>
                          <td>{entry.playCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
