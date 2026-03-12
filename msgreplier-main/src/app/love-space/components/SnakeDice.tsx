import { useCallback, useEffect, useState } from 'react';
import styles from './ludo/components/Dice/Dice.module.css';
import clsx from 'clsx';
import { TPlayerColour } from './ludo/types';
import { playerColours } from './ludo/game/players/constants';

type Props = {
  isRolling: boolean;
  diceNumber: number | null;
  colour: TPlayerColour;
  playerName: string;
  isMyTurn: boolean;
  onDiceClick: () => void;
  disabled: boolean;
  interactiveMsg?: string;
};

function SnakeDice({
  isRolling,
  diceNumber,
  colour,
  onDiceClick,
  playerName,
  isMyTurn,
  disabled,
  interactiveMsg
}: Props) {
  // Handle local state for animated rolling effect
  const [internalDiceNum, setInternalDiceNum] = useState(1);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRolling) {
      interval = setInterval(() => {
        setInternalDiceNum(Math.floor(Math.random() * 6) + 1);
      }, 80);
    } else {
      setInternalDiceNum(diceNumber || 1);
    }
    return () => clearInterval(interval);
  }, [isRolling, diceNumber]);

  return (
    <div className={clsx(styles.diceContainer, styles[colour])}>
      <span className={styles.playerName}>{playerName}</span>
      <button
        className={clsx(styles.dice, {
          [styles.active]: !disabled && isMyTurn,
          [styles.rolling]: isRolling,
        })}
        tabIndex={disabled ? -1 : undefined}
        title={!disabled ? 'Roll Dice' : undefined}
        style={{ '--player-colour': playerColours[colour] } as React.CSSProperties}
        type="button"
        onClick={onDiceClick}
        disabled={disabled}
      >
        <div className={clsx(styles.diceFace, styles[`face${internalDiceNum}`])}>
          <span className={clsx(styles.dot, styles.dot1)} />
          <span className={clsx(styles.dot, styles.dot2)} />
          <span className={clsx(styles.dot, styles.dot3)} />
          <span className={clsx(styles.dot, styles.dot4)} />
          <span className={clsx(styles.dot, styles.dot5)} />
          <span className={clsx(styles.dot, styles.dot6)} />
          <span className={clsx(styles.dot, styles.dot7)} />
        </div>
      </button>
      {interactiveMsg && (
        <span className="text-[10px] mt-1 font-bold text-gray-500 animate-pulse">{interactiveMsg}</span>
      )}
    </div>
  );
}

export default SnakeDice;
