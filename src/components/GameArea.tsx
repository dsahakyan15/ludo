import { LudoBoard } from './LudoBoard';
import { PlayerProfile } from './PlayerProfile';
import type { MovingPiece, Piece, Team } from '../game/types';
import { TEAMS } from '../game/constants';

interface GameAreaProps {
  activeTeams: Team[];
  pieces: Piece[];
  turn: Team;
  dice: number | null;
  rolling: boolean;
  movingPiece: MovingPiece | null;
  canMove: (piece: Piece, value: number) => boolean;
  onMovePiece: (piece: Piece) => void;
  onRollDice: () => void;
}

export function GameArea({
  activeTeams,
  pieces,
  turn,
  dice,
  rolling,
  movingPiece,
  canMove,
  onMovePiece,
  onRollDice,
}: GameAreaProps) {
  return (
    <div className="game-area">
      {TEAMS.map((team) => (
        <PlayerProfile
          key={team}
          team={team}
          active={activeTeams.includes(team)}
          currentTurn={turn === team}
          dice={dice}
          rolling={rolling}
          onRollDice={onRollDice}
        />
      ))}
      <LudoBoard
        activeTeams={activeTeams}
        pieces={pieces}
        turn={turn}
        dice={dice}
        movingPiece={movingPiece}
        canMove={canMove}
        onMovePiece={onMovePiece}
      />
    </div>
  );
}
