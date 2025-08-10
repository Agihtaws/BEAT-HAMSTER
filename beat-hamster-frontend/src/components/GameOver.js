import React from 'react';

const GameOver = ({ score, bonusPointsEarned, totalBonusPoints, isLoading, resetGame }) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h2>Game Over!</h2>
        <p className="final-score">Your Score: {score}</p>
        <p className="bonus-points">Bonus Points Earned: {bonusPointsEarned}</p>
        <p className="total-bonus">Total Bonus Points: {totalBonusPoints}</p>
        {isLoading ? (
          <p className="submitting">Submitting score...</p>
        ) : (
          <button onClick={resetGame} className="back-button">
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default GameOver;
