import type { Team } from '../game/types';

interface GameInfoProps {
  playerCount: 2 | 4;
  turn: Team;
  turnTimeLeft: number;
  winners: Team[];
  onRestart: () => void;
}

export function GameInfo({ playerCount, turn, turnTimeLeft, winners, onRestart }: GameInfoProps) {
  return (
    <div className="game-info">
      <div>
        <div className="turn-summary">
          <div className={`turn-indicator ${turn}`}>Turn: {turn.toUpperCase()}</div>
          <div className="turn-timer">Timer: {turnTimeLeft}s</div>
        </div>
        <div className="player-count-label">{playerCount} Players</div>
      </div>
      {winners.length > 0 && (
        <div className="winners">
          Winners: {winners.join(', ')}
        </div>
      )}
      <button type="button" className="menu-link-button" onClick={onRestart}>
        Change Players
      </button>
    </div>
  );
}
