import './App.css';
import { GameArea } from './components/GameArea';
import { GameInfo } from './components/GameInfo';
import { useLudoGame } from './game/useLudoGame';
import type { Team } from './game/types';
import { useState } from 'react';

const TWO_PLAYER_TEAMS: Team[] = ['red', 'blue'];
const FOUR_PLAYER_TEAMS: Team[] = ['green', 'red', 'yellow', 'blue'];

function App() {
  const [playerCount, setPlayerCount] = useState<2 | 4 | null>(null);
  const activeTeams = playerCount === 2 ? TWO_PLAYER_TEAMS : FOUR_PLAYER_TEAMS;
  const game = useLudoGame(activeTeams);

  if (playerCount === null) {
    return (
      <div className="menu-screen">
        <div className="menu-card">
          <p className="menu-eyebrow">Ludo</p>
          <h1>Choose a match setup</h1>
          <p className="menu-copy">Pick a quick head-to-head or a full four-player board.</p>
          <div className="menu-actions">
            <button type="button" className="menu-button" onClick={() => setPlayerCount(2)}>
              2 Players
            </button>
            <button type="button" className="menu-button" onClick={() => setPlayerCount(4)}>
              4 Players
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ludo-container">
      <GameInfo
        playerCount={playerCount}
        turn={game.turn}
        winners={game.winners}
        onRestart={() => setPlayerCount(null)}
      />
      <GameArea
        activeTeams={activeTeams}
        pieces={game.pieces}
        turn={game.turn}
        dice={game.dice}
        rolling={game.rolling}
        movingPiece={game.movingPiece}
        canMove={game.canMove}
        onMovePiece={game.movePiece}
        onRollDice={game.rollDice}
      />
      {game.isGameOver && (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <h1>Game Over!</h1>
            <div className="winner-list">
              {game.winners.map((team, index) => (
                <div key={team} className={`winner-item ${team}`}>
                  <span>{index + 1}st Place:</span>
                  <strong>{team.toUpperCase()}</strong>
                </div>
              ))}
            </div>
            <button type="button" className="menu-button" onClick={() => setPlayerCount(null)}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
