// Process leaderboard to remove duplicates and add play count
export const processLeaderboard = (rawLeaderboard) => {
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

// Sound effects
export const playSound = (soundName) => {
  const sound = new Audio(`/sounds/${soundName}.mp3`);
  sound.play().catch(e => console.log("Audio play error:", e));
};
