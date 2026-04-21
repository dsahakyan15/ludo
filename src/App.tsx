import React, { useState } from 'react';
import './App.css';

type Team = 'green' | 'red' | 'yellow' | 'blue';

interface Piece {
  team: Team;
  id: number;
  pos: number | null; // 0 to 56, null if in base
}

const TEAMS: Team[] = ['green', 'red', 'yellow', 'blue'];

const COMMON_PATH: [number, number][] = [
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
  [7, 0]
];

const HOME_STRETCHES: Record<Team, [number, number][]> = {
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

const START_INDICES: Record<Team, number> = {
  green: 1,
  red: 14,
  yellow: 27,
  blue: 40,
};

const SAFE_CELLS: [number, number][] = [
  [6, 1], [1, 8], [8, 13], [13, 6],
  [2, 6], [6, 12], [12, 8], [8, 2]
];

const getPlayerPath = (team: Team): [number, number][] => {
  const start = START_INDICES[team];
  const path: [number, number][] = [];
  for (let i = 0; i < 51; i++) {
    path.push(COMMON_PATH[(start + i) % 52]);
  }
  return [...path, ...HOME_STRETCHES[team]];
};

const PLAYER_PATHS: Record<Team, [number, number][]> = {
  green: getPlayerPath('green'),
  red: getPlayerPath('red'),
  yellow: getPlayerPath('yellow'),
  blue: getPlayerPath('blue'),
};

const BASE_COORDS: Record<Team, [number, number][]> = {
  green: [[1, 1], [1, 4], [4, 1], [4, 4]],
  red: [[1, 10], [1, 13], [4, 10], [4, 13]],
  blue: [[10, 1], [10, 4], [13, 1], [13, 4]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
};

function App() {
  const [pieces, setPieces] = useState<Piece[]>(() => {
    const initial: Piece[] = [];
    TEAMS.forEach(team => {
      for (let i = 1; i <= 4; i++) {
        initial.push({ team, id: i, pos: null });
      }
    });
    return initial;
  });

  const [turn, setTurn] = useState<Team>('green');
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winners, setWinners] = useState<Team[]>([]);

  const rollDice = () => {
    if (dice !== null || rolling) return;
    setRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDice(val);
      setRolling(false);
      
      // Check if any move is possible
      const possible = pieces.filter(p => p.team === turn && canMove(p, val));
      if (possible.length === 0) {
        setTimeout(() => nextTurn(), 1000);
      }
    }, 600);
  };

  const canMove = (piece: Piece, value: number) => {
    if (piece.pos === null) return value === 6;
    if (piece.pos + value > 56) return false;
    return true;
  };

  const nextTurn = () => {
    setDice(null);
    setTurn(prev => {
      let nextIdx = (TEAMS.indexOf(prev) + 1) % 4;
      while (winners.includes(TEAMS[nextIdx])) {
        nextIdx = (nextIdx + 1) % 4;
        if (TEAMS[nextIdx] === prev) break;
      }
      return TEAMS[nextIdx];
    });
  };

  const movePiece = (piece: Piece) => {
    if (dice === null || rolling || piece.team !== turn || !canMove(piece, dice)) return;

    const newPos = piece.pos === null ? 0 : piece.pos + dice;
    const targetCoords = PLAYER_PATHS[piece.team][newPos];
    
    let updatedPieces = pieces.map(p => {
      if (p.team === piece.team && p.id === piece.id) {
        return { ...p, pos: newPos };
      }
      return p;
    });

    // Check for kicking out
    if (newPos < 51) { // Only in common path
      const isSafe = SAFE_CELLS.some(c => c[0] === targetCoords[0] && c[1] === targetCoords[1]);
      if (!isSafe) {
        updatedPieces = updatedPieces.map(p => {
          if (p.team !== piece.team && p.pos !== null && p.pos < 51) {
            const pCoords = PLAYER_PATHS[p.team][p.pos];
            if (pCoords[0] === targetCoords[0] && pCoords[1] === targetCoords[1]) {
              return { ...p, pos: null };
            }
          }
          return p;
        });
      }
    }

    setPieces(updatedPieces);

    // Check win condition
    const teamPieces = updatedPieces.filter(p => p.team === piece.team);
    if (teamPieces.every(p => p.pos === 56)) {
      if (!winners.includes(piece.team)) {
        setWinners([...winners, piece.team]);
      }
    }

    if (dice !== 6) {
      nextTurn();
    } else {
      setDice(null);
    }
  };

  const renderCell = (r: number, c: number) => {
    let className = 'cell';
    let style: React.CSSProperties = {};

    // Base colors
    if (r < 6 && c < 6) className += ' green-base';
    else if (r < 6 && c > 8) className += ' red-base';
    else if (r > 8 && c < 6) className += ' blue-base';
    else if (r > 8 && c > 8) className += ' yellow-base';

    // Home stretches
    if (r === 7 && c > 0 && c < 6) className += ' green-cell';
    if (c === 7 && r > 0 && r < 6) className += ' red-cell';
    if (r === 7 && c > 8 && c < 14) className += ' yellow-cell';
    if (c === 7 && r > 8 && r < 14) className += ' blue-cell';

    // Start cells
    if (r === 6 && c === 1) className += ' green-cell start-cell';
    if (r === 1 && c === 8) className += ' red-cell start-cell';
    if (r === 8 && c === 13) className += ' yellow-cell start-cell';
    if (r === 13 && c === 6) className += ' blue-cell start-cell';

    // Stars
    const isStar = SAFE_CELLS.some(sc => sc[0] === r && sc[1] === c) && !START_INDICES[TEAMS.find(t => START_INDICES[t] === COMMON_PATH.findIndex(cp => cp[0] === r && cp[1] === c)) as Team];
    
    // Pieces in this cell
    const cellPieces = pieces.filter(p => {
      if (p.pos === null) {
        const baseCoords = BASE_COORDS[p.team][p.id - 1];
        return baseCoords[0] === r && baseCoords[1] === c;
      }
      const pCoords = PLAYER_PATHS[p.team][p.pos];
      return pCoords[0] === r && pCoords[1] === c;
    });

    return (
      <div key={`${r}-${c}`} className={className} style={style}>
        {isStar && <span className="star">★</span>}
        {cellPieces.map((p, idx) => (
          <div
            key={`${p.team}-${p.id}`}
            className={`piece ${p.team} ${p.team === turn && dice !== null && canMove(p, dice) ? 'clickable' : ''}`}
            style={{
              transform: cellPieces.length > 1 ? `translate(${(idx % 2) * 5}px, ${Math.floor(idx / 2) * 5}px) scale(0.8)` : 'none',
              zIndex: p.team === turn ? 10 : 1
            }}
            onClick={() => movePiece(p)}
          />
        ))}
        {r == 7 && c==7 && (
          <div className="home-center">
            <div className="tri green-tri"></div>
            <div className="tri red-tri"></div>
            <div className="tri yellow-tri"></div>
            <div className="tri blue-tri"></div>
          </div>
        )}
      </div>
    );
  };

  const grid = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      grid.push(renderCell(r, c));
    }
  }

  return (
    <div className="ludo-container">
      <div className="game-info">
        <div className={`turn-indicator ${turn}`}>
          Turn: {turn.toUpperCase()}
        </div>
        <div className="dice-section">
          <div className={`dice ${rolling ? 'rolling' : ''}`} onClick={rollDice}>
            {dice || '?'}
          </div>
          {dice === 6 && <div className="extra-roll">Extra Roll!</div>}
        </div>
        {winners.length > 0 && (
          <div className="winners">
            Winners: {winners.join(', ')}
          </div>
        )}
      </div>
      <div className="board">
        {grid}
      </div>
    </div>
  );
}

export default App;
