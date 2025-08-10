import React from 'react';

const Leaderboard = ({ leaderboard, account }) => {
  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
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
  );
};

export default Leaderboard;
