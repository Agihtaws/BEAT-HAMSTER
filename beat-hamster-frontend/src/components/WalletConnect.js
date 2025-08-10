import React from 'react';

const WalletConnect = ({ 
  walletConnected, 
  account, 
  bestScore, 
  bonusPoints, 
  connectWallet, 
  redeemTokens, 
  startGame, 
  isLoading 
}) => {
  return (
    <>
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
                {isLoading ? 'Processing...' : 'Redeem Tokens'}
              </button>
            )}
            <button 
              onClick={startGame} 
              className="start-button"
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnect;
