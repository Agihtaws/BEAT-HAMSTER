import React from 'react';
import Hamster from './Hamster';

const GameBoard = ({ gameActive, gameOver, activeHamster, hitHamster }) => {
  return (
    <div className={`game-grid ${gameOver ? 'blurred' : ''}`}>
      {Array(16).fill(null).map((_, index) => (
        <div 
          key={index} 
          className={`grid-cell ${activeHamster === index ? 'active' : ''}`}
          onClick={() => gameActive && hitHamster(index)}
        >
          {activeHamster === index && <Hamster />}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
