import { useEffect, useRef, useState } from 'react';
import { PLAYER_PATHS, SAFE_CELLS } from './constants';
import { canMovePiece, createInitialPieces } from './utils';
import type { MovingPiece, Piece, Team } from './types';

const TURN_DURATION_SECONDS = 15;

export function useLudoGame(activeTeams: Team[]) {
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialPieces(activeTeams));
  const [turn, setTurn] = useState<Team>(activeTeams[0]);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winners, setWinners] = useState<Team[]>([]);
  const [movingPiece, setMovingPiece] = useState<MovingPiece | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [turnTimerCycle, setTurnTimerCycle] = useState(0);
  const turnDeadlineRef = useRef<number>(Date.now() + TURN_DURATION_SECONDS * 1000);
  const movingPieceRef = useRef<MovingPiece | null>(null);

  useEffect(() => {
    setPieces(createInitialPieces(activeTeams));
    setTurn(activeTeams[0]);
    setDice(null);
    setRolling(false);
    setWinners([]);
    setMovingPiece(null);
    setTurnTimeLeft(TURN_DURATION_SECONDS);
    setTurnTimerCycle(0);
    turnDeadlineRef.current = Date.now() + TURN_DURATION_SECONDS * 1000;
  }, [activeTeams]);

  const canMove = (piece: Piece, value: number) => canMovePiece(piece, value);

  const restartTurnTimer = () => {
    turnDeadlineRef.current = Date.now() + TURN_DURATION_SECONDS * 1000;
    setTurnTimeLeft(TURN_DURATION_SECONDS);
    setTurnTimerCycle((currentCycle) => currentCycle + 1);
  };

  const nextTurn = () => {
    setDice(null);
    setTurn((prev) => {
      let nextIdx = (activeTeams.indexOf(prev) + 1) % activeTeams.length;
      while (winners.includes(activeTeams[nextIdx])) {
        nextIdx = (nextIdx + 1) % activeTeams.length;
        if (activeTeams[nextIdx] === prev) break;
      }
      return activeTeams[nextIdx];
    });
  };

  const rollDice = () => {
    if (dice !== null || rolling || movingPiece) return;

    setRolling(true);
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDice(value);
      setRolling(false);

      const possible = pieces.filter((piece) => piece.team === turn && canMove(piece, value));
      if (possible.length === 0) {
        setTimeout(() => nextTurn(), 1000);
      }
    }, 600);
  };

  const movePiece = async (piece: Piece) => {
    if (dice === null || rolling || movingPiece || piece.team !== turn || !canMove(piece, dice)) return;

    setMovingPiece({ team: piece.team, id: piece.id });

    const steps = piece.pos === null ? 1 : dice;
    let currentPos = piece.pos;

    for (let i = 1; i <= steps; i++) {
      currentPos = currentPos === null ? 0 : currentPos + 1;
      setPieces((prev) =>
        prev.map((currentPiece) =>
          currentPiece.team === piece.team && currentPiece.id === piece.id
            ? { ...currentPiece, pos: currentPos }
            : currentPiece,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (currentPos === null) {
      setMovingPiece(null);
      return;
    }

    const finalPos = currentPos;
    const targetCoords = PLAYER_PATHS[piece.team][finalPos];

    setMovingPiece(null);

    setPieces((prev) => {
      const updated = prev.map((currentPiece) =>
        currentPiece.team === piece.team && currentPiece.id === piece.id
          ? { ...currentPiece, pos: finalPos }
          : currentPiece,
      );

      let captured = [...updated];
      if (finalPos < 51) {
        const isSafe = SAFE_CELLS.some((cell) => cell[0] === targetCoords[0] && cell[1] === targetCoords[1]);
        if (!isSafe) {
          captured = captured.map((currentPiece) => {
            if (currentPiece.team !== piece.team && currentPiece.pos !== null && currentPiece.pos < 51) {
              const currentCoords = PLAYER_PATHS[currentPiece.team][currentPiece.pos];
              if (currentCoords[0] === targetCoords[0] && currentCoords[1] === targetCoords[1]) {
                return { ...currentPiece, pos: null };
              }
            }
            return currentPiece;
          });
        }
      }

      const teamPieces = captured.filter((currentPiece) => currentPiece.team === piece.team);
      if (teamPieces.every((currentPiece) => currentPiece.pos === 56)) {
        setWinners((currentWinners) =>
          currentWinners.includes(piece.team) ? currentWinners : [...currentWinners, piece.team],
        );
      }

      return captured;
    });

    if (dice !== 6) {
      nextTurn();
    } else {
      setDice(null);
      restartTurnTimer();
    }
  };

  const isGameOver = winners.length >= activeTeams.length - 1 && activeTeams.length > 1;

  useEffect(() => {
    movingPieceRef.current = movingPiece;
  }, [movingPiece]);

  useEffect(() => {
    if (isGameOver) {
      return;
    }

    turnDeadlineRef.current = Date.now() + TURN_DURATION_SECONDS * 1000;
    setTurnTimeLeft(TURN_DURATION_SECONDS);

    const intervalId = window.setInterval(() => {
      if (movingPieceRef.current) {
        return;
      }

      const secondsLeft = Math.max(0, Math.ceil((turnDeadlineRef.current - Date.now()) / 1000));
      setTurnTimeLeft(secondsLeft);

      if (secondsLeft === 0) {
        window.clearInterval(intervalId);
        nextTurn();
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [turn, turnTimerCycle, isGameOver]);

  return {
    pieces,
    turn,
    dice,
    rolling,
    winners,
    movingPiece,
    isGameOver,
    turnTimeLeft,
    turnTimerCycle,
    canMove,
    rollDice,
    movePiece,
  };
}
