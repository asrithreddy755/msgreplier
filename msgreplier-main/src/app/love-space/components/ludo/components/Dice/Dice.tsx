import { useCallback, useEffect, useMemo, useState } from 'react';
import { type TPlayerColour } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../state/store';
import { ERRORS } from '../../utils/errors';
import { rollDiceThunk } from '../../state/thunks/rollDiceThunk';
import { playDiceSound } from '../../utils/diceSound';
import { playerColours } from '../../game/players/constants';
import { isAnyTokenActiveOfColour } from '../../game/tokens/logic';
import styles from './Dice.module.css';
import clsx from 'clsx';

type Props = {
  colour: TPlayerColour;
  playerName: string;
  onDiceClick: (colour: TPlayerColour, diceNumber: number) => void;
  myColour: TPlayerColour;
  otherOnline?: boolean;
};

function Dice({ colour, onDiceClick, playerName, myColour, otherOnline = true }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isAnyTokenMoving,
    isGameEnded,
    currentPlayerColour: currentPlayer,
    players,
  } = useSelector((state: RootState) => state.players);
  const { diceNumber, isPlaceholderShowing } =
    useSelector((state: RootState) => state.dice.dice.find((d: any) => d.colour === colour)) ?? {};

  const anyTokenActive = useMemo(
    () => isAnyTokenActiveOfColour(colour, players),
    [colour, players]
  );
  const isBot = players.find((p: any) => p.colour === colour)?.isBot;
  const isCurrentPlayer = currentPlayer === colour;
  const isDiceDisabled =
    !isCurrentPlayer ||
    myColour !== colour ||
    anyTokenActive ||
    isAnyTokenMoving ||
    isGameEnded ||
    isPlaceholderShowing ||
    isBot ||
    !otherOnline;

  const handleDiceClick = useCallback(() => {
    if (isDiceDisabled) return;
    if (!otherOnline) return; // Added this line
    playDiceSound(); // Instant sound for the local roller
    dispatch(rollDiceThunk(colour, (rolledNumber) => onDiceClick(colour, rolledNumber)));
  }, [colour, dispatch, isDiceDisabled, onDiceClick, otherOnline]); // Added otherOnline to dependencies

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key.toLowerCase() !== 'd' || isDiceDisabled) return;
      handleDiceClick();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDiceClick, isDiceDisabled]);

  // Handle local state for animated rolling effect
  const [internalDiceNum, setInternalDiceNum] = useState(1);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaceholderShowing) {
      // Sound is played immediately: by handleDiceClick (local roller)
      // or by the dice_start WebRTC handler in ludo.tsx (remote player).
      // Do NOT play here to avoid a delayed double-sound.
      interval = setInterval(() => {
        setInternalDiceNum(Math.floor(Math.random() * 6) + 1);
      }, 280);
    } else {
      setInternalDiceNum(diceNumber || 1);
    }
    return () => clearInterval(interval);
  }, [isPlaceholderShowing, diceNumber]);

  return (
    <div className={clsx(styles.diceContainer, styles[colour])}>
      <div className="relative inline-block">
        <span className={clsx(styles.playerName, {
          [styles.active]: isCurrentPlayer,
          [styles.inactive]: !isCurrentPlayer,
        })}>
          {playerName}
        </span>
      </div>
      <button
        className={clsx(styles.dice, {
          [styles.turnActive]: isCurrentPlayer,
          [styles.turnInactive]: !isCurrentPlayer,
          [styles.rolling]: isPlaceholderShowing,
        })}
        tabIndex={isDiceDisabled ? -1 : undefined}
        title={!isDiceDisabled ? 'Roll Dice (Press D)' : undefined}
        style={{ '--player-colour': playerColours[colour] } as React.CSSProperties}
        type="button"
        onClick={handleDiceClick}
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
    </div>
  );
}
export default Dice;
