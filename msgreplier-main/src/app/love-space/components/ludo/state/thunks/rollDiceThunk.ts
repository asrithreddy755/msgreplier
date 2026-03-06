// @ts-nocheck
import { renewRollBag, resolveRoll, setIsPlaceholderShowing } from '../slices/diceSlice';
import type { TPlayerColour } from '../../types';
import type { AppDispatch, RootState } from '../store';

const DICE_PLACEHOLDER_DELAY = 1000;

export function rollDiceThunk(colour: TPlayerColour, onDiceRoll: (diceNumber: number) => void) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().players.isGameEnded) return;
    if (getState().dice.dice.find((d) => d.colour === colour)?.isPlaceholderShowing) return;
    // Start spinner (separate from resolveRoll — this is the deliberate "start" signal)
    dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: true }));
    setTimeout(() => {
      const diceState = getState().dice;
      const dice = diceState.dice.find((d) => d.colour === colour);
      if (diceState.rollBag[colour].length === 0) dispatch(renewRollBag(colour));
      const bag = getState().dice.rollBag[colour];
      const index = Math.floor(Math.random() * bag.length);
      const diceNumber = bag[index];
      // Single atomic dispatch: stops spinner + sets final number in ONE state update
      // → one React re-render → Dice.tsx useEffect fires exactly once per roll
      dispatch(resolveRoll({ colour, randomIndex: index }));
      if (dice) onDiceRoll(diceNumber);
    }, DICE_PLACEHOLDER_DELAY);
  };
}
