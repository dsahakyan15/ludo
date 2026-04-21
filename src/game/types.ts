export type Team = 'green' | 'red' | 'yellow' | 'blue';

export type Coord = [number, number];

export interface Piece {
  team: Team;
  id: number;
  pos: number | null;
}

export interface MovingPiece {
  team: Team;
  id: number;
}
