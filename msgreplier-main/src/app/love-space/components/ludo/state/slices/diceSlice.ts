import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TPlayerColour } from '../../types';
import { ERRORS } from '../../utils/errors';
import type { TDice } from '../../types';

export type TDiceState = {
  dice: TDice[];
  rollBag: Record<TPlayerColour, number[]>;
};

export const initialState: TDiceState = {
  dice: [],
  rollBag: { blue: [], red: [], green: [], yellow: [] },
};

export function getDice(state: TDiceState, colour: TPlayerColour): TDice | undefined {
  return state.dice.find((d) => d.colour === colour);
}

export function generateRollBag(): number[] {
  const diceNumbers = Array(36)
    .fill(null)
    .map((_, i) => (i % 6) + 1);
  // Fisher-Yates shuffle so rolls are not sequential
  for (let i = diceNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [diceNumbers[i], diceNumbers[j]] = [diceNumbers[j], diceNumbers[i]];
  }
  return diceNumbers;
}

const reducers = {
  registerDice: (state: TDiceState, action: PayloadAction<TPlayerColour>) => {
    if (state.dice.some((d) => d.colour === action.payload)) return; // Prevent duplicate dice on remount
    state.dice.push({
      colour: action.payload,
      diceNumber: 1,
      isPlaceholderShowing: false,
    });
    state.rollBag[action.payload] = generateRollBag();
  },
  setIsPlaceholderShowing: (
    state: TDiceState,
    action: PayloadAction<{ colour: TPlayerColour; isPlaceholderShowing: boolean }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    if (dice) {
      dice.isPlaceholderShowing = action.payload.isPlaceholderShowing;
    }
  },
  setDiceNumber: (
    state: TDiceState,
    action: PayloadAction<{ colour: TPlayerColour; randomIndex: number }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    if (dice) {
      dice.diceNumber = state.rollBag[action.payload.colour][action.payload.randomIndex];
      state.rollBag[action.payload.colour] = state.rollBag[action.payload.colour].filter(
        (_, i) => i !== action.payload.randomIndex
      );
    }
  },
  // Atomically resolves a roll: stops the spinner AND sets the final number in one
  // state update → one React render → Dice.tsx useEffect fires exactly once per roll.
  resolveRoll: (
    state: TDiceState,
    action: PayloadAction<{ colour: TPlayerColour; randomIndex: number }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    if (dice) {
      dice.isPlaceholderShowing = false;
      dice.diceNumber = state.rollBag[action.payload.colour][action.payload.randomIndex];
      state.rollBag[action.payload.colour] = state.rollBag[action.payload.colour].filter(
        (_, i) => i !== action.payload.randomIndex
      );
    }
  },
  resolveBroadcastRoll: (
    state: TDiceState,
    action: PayloadAction<{ colour: TPlayerColour; diceNumber: number }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    if (dice) {
      dice.isPlaceholderShowing = false;
      dice.diceNumber = action.payload.diceNumber;
    }
  },
  renewRollBag: (state: TDiceState, action: PayloadAction<TPlayerColour>) => {
    state.rollBag[action.payload] = generateRollBag();
  },
  clearDiceState: () => structuredClone(initialState),
};

const diceSlice = createSlice({
  name: 'dice',
  initialState,
  reducers,
});

export const {
  registerDice,
  setDiceNumber,
  setIsPlaceholderShowing,
  resolveRoll,
  resolveBroadcastRoll,
  renewRollBag,
  clearDiceState,
} = diceSlice.actions;

export default diceSlice.reducer;
