import { configureStore, combineReducers } from '@reduxjs/toolkit';
import playersReducer from './slices/playersSlice';
import boardReducer from './slices/boardSlice';
import diceReducer from './slices/diceSlice';
import sessionReducer from './slices/sessionSlice';

const appReducer = combineReducers({
  players: playersReducer,
  board: boardReducer,
  dice: diceReducer,
  session: sessionReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'HYDRATE_GAME_STATE') {
    // Safely merge incoming remote state into existing structure
    // Ensure we don't sync 'isPlaceholderShowing' so we don't get stuck in a dice animation loop
    const incomingDiceEntries = action.payload.dice?.dice;
    // Never replace a populated local dice array with an empty one —
    // that would blank out the dice panel when state is received before registration
    const mergedDiceEntries = (incomingDiceEntries && incomingDiceEntries.length > 0)
      ? incomingDiceEntries.map((d: any) => {
        const localDice = state.dice?.dice?.find((ld: any) => ld.colour === d.colour);
        return { ...d, isPlaceholderShowing: localDice ? localDice.isPlaceholderShowing : false };
      })
      : (state.dice?.dice ?? []);

    const hydratedDice = action.payload.dice ? {
      ...action.payload.dice,
      dice: mergedDiceEntries,
    } : state.dice;

    const hydratedState = {
      players: action.payload.players || state.players,
      board: state.board, // Purely local responsive dimensions, never sync from remote
      dice: hydratedDice,
      session: action.payload.session || state.session,
    };
    return hydratedState;
  }
  return appReducer(state, action);
};

// We will inject a sync callback from the React component
let syncCallback: ((state: any) => void) | null = null;
export const setSyncCallback = (cb: (state: any) => void) => { syncCallback = cb; };

// --- Explicit Commit Model ---
// Instead of maintaining a growing exclusion list of action types, we use a turn-in-progress
// flag. While a turn is active, all Redux actions are muted from triggering DB writes.
// When the turn fully resolves (token landed, turn changed), commitTurn() is called ONCE to
// flush exactly one DB write with the final authoritative state.

let isTurnInProgress = false;

/** Call at the start of every dice roll to suppress all intermediate DB writes. */
export const startTurn = () => { isTurnInProgress = true; };

/**
 * Call exactly once when a turn fully resolves (changeTurnThunk, markTokenAsReachedHome, etc.).
 * Unmutes the middleware and immediately fires syncCallback with the current state.
 */
export const commitTurn = (storeInstance: typeof store) => {
  isTurnInProgress = false;
  if (syncCallback) syncCallback(storeInstance.getState());
};

const syncMiddleware = (storeInstance: any) => (next: any) => (action: any) => {
  const result = next(action);
  // Auto-sync was causing initialization actions in client 2 to overwrite the live game state.
  // We now rely solely on explicit commitTurn calls to persist data to Supabase.
  return result;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(syncMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
