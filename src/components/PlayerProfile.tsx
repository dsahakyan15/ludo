import type { Team } from '../game/types';
import { Dice } from './Dice';

interface PlayerProfileProps {
  team: Team;
  active: boolean;
  currentTurn: boolean;
  dice: number | null;
  rolling: boolean;
  onRollDice: () => void;
}

const TEAM_LABELS: Record<Team, string> = {
  green: 'Guest',
  red: 'Guest',
  yellow: 'Guest',
  blue: 'Guest',
};

const TEAM_NAMES: Record<Team, string> = {
  green: 'Green',
  red: 'Red',
  yellow: 'Yellow',
  blue: 'Blue',
};

export function PlayerProfile({
  team,
  active,
  currentTurn,
  dice,
  rolling,
  onRollDice,
}: PlayerProfileProps) {
  return (
    <div className={`player-profile-group ${team} ${currentTurn ? 'current-turn' : ''} ${active ? '' : 'inactive'}`.trim()}>
      <div className="player-profile-card">
        <div className="player-avatar-shell">
          <div className="player-avatar">{TEAM_NAMES[team].slice(0, 1)}</div>
        </div>
        <div className="player-meta">
          <div className="player-name">{TEAM_NAMES[team]}</div>
          <div className="player-tag">{TEAM_LABELS[team]}</div>
        </div>
      </div>
      
      {active && currentTurn && (
        <div className="player-dice-pod">
          <Dice value={dice} rolling={rolling} onRoll={onRollDice} />
        </div>
      )}
    </div>
  );
}
