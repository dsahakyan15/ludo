interface DiceProps {
  value: number | null;
  rolling: boolean;
  onRoll: () => void;
}

export function Dice({ value, rolling, onRoll }: DiceProps) {
  return (
    <div className="dice-section">
      <button type="button" className={`dice ${rolling ? 'rolling' : ''}`} onClick={onRoll}>
        {value || '?'}
      </button>
      {value === 6 && <div className="extra-roll">Extra Roll!</div>}
    </div>
  );
}
