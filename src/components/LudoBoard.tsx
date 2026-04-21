import { Pawn } from './Pawn';
import {
  BASE_COORDS,
  COMMON_PATH,
  PLAYER_PATHS,
  SAFE_CELLS,
  START_INDICES,
  TEAMS,
} from '../game/constants';
import { getPieceOffset, getRenderableBoardCells } from '../game/utils';
import type { MovingPiece, Piece, Team } from '../game/types';

interface LudoBoardProps {
  activeTeams: Team[];
  pieces: Piece[];
  turn: Team;
  dice: number | null;
  movingPiece: MovingPiece | null;
  canMove: (piece: Piece, value: number) => boolean;
  onMovePiece: (piece: Piece) => void;
}

function renderCell(r: number, c: number) {
  let className = 'cell';

  if (r === 7 && c > 0 && c < 6) className += ' green-cell';
  if (c === 7 && r > 0 && r < 6) className += ' red-cell';
  if (r === 7 && c > 8 && c < 14) className += ' yellow-cell';
  if (c === 7 && r > 8 && r < 14) className += ' blue-cell';

  if (r === 6 && c === 1) className += ' green-cell start-cell';
  if (r === 1 && c === 8) className += ' red-cell start-cell';
  if (r === 8 && c === 13) className += ' yellow-cell start-cell';
  if (r === 13 && c === 6) className += ' blue-cell start-cell';

  const isStar =
    SAFE_CELLS.some((cell) => cell[0] === r && cell[1] === c) &&
    !TEAMS.some(
      (team) => START_INDICES[team] === COMMON_PATH.findIndex((pathCell) => pathCell[0] === r && pathCell[1] === c),
    );

  return (
    <div key={`${r}-${c}`} className={className}>
      {isStar && <span className="star">★</span>}
      {r === 7 && c === 7 && <div className="home-center"></div>}
    </div>
  );
}

export function LudoBoard({
  activeTeams,
  pieces,
  turn,
  dice,
  movingPiece,
  canMove,
  onMovePiece,
}: LudoBoardProps) {
  const grid = [
    ...TEAMS.map((team) => (
      <div
        key={`base-${team}`}
        className={`base-container ${team}-base ${activeTeams.includes(team) ? '' : 'inactive-base'}`.trim()}
      >
        <div className="base-inner">
          <div className="base-slot slot-1"></div>
          <div className="base-slot slot-2"></div>
          <div className="base-slot slot-3"></div>
          <div className="base-slot slot-4"></div>
        </div>
      </div>
    )),
    ...getRenderableBoardCells().map(([r, c]) => renderCell(r, c)),
  ];

  return (
    <div className="board">
      {grid}
      {pieces.map((piece) => {
        const isInBase = piece.pos === null;
        const coords = piece.pos === null ? BASE_COORDS[piece.team][piece.id - 1] : PLAYER_PATHS[piece.team][piece.pos];
        const isMoving = movingPiece?.team === piece.team && movingPiece?.id === piece.id;
        const isClickable = piece.team === turn && dice !== null && !movingPiece && canMove(piece, dice);
        const offset = getPieceOffset(piece, pieces, coords);

        return (
          <div
            key={`${piece.team}-${piece.id}`}
            className={`piece-wrapper ${piece.team} ${isInBase ? 'in-base' : ''} ${isMoving ? 'moving' : ''} ${isClickable ? 'clickable' : ''}`}
            style={{
              top: `calc((${coords[0]} + 0.5) * var(--cell-size))`,
              left: `calc((${coords[1]} + 0.5) * var(--cell-size))`,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              zIndex: isMoving ? 100 : piece.team === turn ? 20 : 10,
            }}
            onClick={() => onMovePiece(piece)}
          >
            <Pawn />
          </div>
        );
      })}
    </div>
  );
}
