import { PLAYER_PATHS, TEAMS } from './constants';
import type { Coord, Piece, Team } from './types';

export function createInitialPieces(activeTeams: Team[] = TEAMS): Piece[] {
  const initial: Piece[] = [];

  activeTeams.forEach((team) => {
    for (let i = 1; i <= 4; i++) {
      initial.push({ team, id: i, pos: null });
    }
  });

  return initial;
}

export function canMovePiece(piece: Piece, value: number) {
  if (piece.pos === null) return value === 6;
  if (piece.pos + value > 56) return false;
  return true;
}

export function getRenderableBoardCells(): Coord[] {
  const cells: Coord[] = [];

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8)) {
        continue;
      }
      cells.push([r, c]);
    }
  }

  return cells;
}

export function getPieceOffset(piece: Piece, pieces: Piece[], coords: Coord) {
  const sameCell = pieces.filter((otherPiece) => {
    if (piece.pos === null || otherPiece.pos === null) return false;
    const otherCoords = PLAYER_PATHS[otherPiece.team][otherPiece.pos];
    return otherCoords[0] === coords[0] && otherCoords[1] === coords[1];
  });

  if (sameCell.length <= 1) {
    return { x: 0, y: 0 };
  }

  const index = sameCell.findIndex((otherPiece) => otherPiece.team === piece.team && otherPiece.id === piece.id);
  return {
    x: index % 2 === 0 ? -5 : 5,
    y: index < 2 ? -5 : 5,
  };
}
