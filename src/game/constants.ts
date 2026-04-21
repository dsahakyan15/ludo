import type { Coord, Team } from './types';

export const TEAMS: Team[] = ['green', 'red', 'yellow', 'blue'];

export const COMMON_PATH: Coord[] = [
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
];

export const HOME_STRETCHES: Record<Team, Coord[]> = {
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

export const START_INDICES: Record<Team, number> = {
  green: 1,
  red: 14,
  yellow: 27,
  blue: 40,
};

export const SAFE_CELLS: Coord[] = [
  [6, 1], [1, 8], [8, 13], [13, 6],
  [2, 6], [6, 12], [12, 8], [8, 2],
];

function getPlayerPath(team: Team): Coord[] {
  const start = START_INDICES[team];
  const path: Coord[] = [];

  for (let i = 0; i < 51; i++) {
    path.push(COMMON_PATH[(start + i) % 52]);
  }

  return [...path, ...HOME_STRETCHES[team]];
}

export const PLAYER_PATHS: Record<Team, Coord[]> = {
  green: getPlayerPath('green'),
  red: getPlayerPath('red'),
  yellow: getPlayerPath('yellow'),
  blue: getPlayerPath('blue'),
};

export const BASE_COORDS: Record<Team, Coord[]> = {
  green: [[1.575, 1.575], [1.575, 3.425], [3.425, 1.575], [3.425, 3.425]],
  red: [[1.575, 10.575], [1.575, 12.425], [3.425, 10.575], [3.425, 12.425]],
  blue: [[10.575, 1.575], [10.575, 3.425], [12.425, 1.575], [12.425, 3.425]],
  yellow: [[10.575, 10.575], [10.575, 12.425], [12.425, 10.575], [12.425, 12.425]],
};
