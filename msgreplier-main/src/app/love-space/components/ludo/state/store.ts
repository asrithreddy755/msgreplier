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
    const hydratedState = {
      players: action.payload.players || state.players,
      board: {
        ...(action.payload.board || state.board),
        boardSideLength: state?.board?.boardSideLength || 0,
        boardTileSize: state?.board?.boardTileSize || 0
      },
      dice: action.payload.dice || state.dice,
      session: action.payload.session || state.session,
    };
    return hydratedState;
  }
  return appReducer(state, action);
};

// We will inject a sync callback from the React component
let syncCallback: ((state: any) => void) | null = null;
export const setSyncCallback = (cb: (state: any) => void) => { syncCallback = cb; };

const syncMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  const type = action.type;
  if (!type.includes('HYDRATE') && !type.includes('board/resizeBoard')) {
    if (syncCallback) syncCallback(store.getState());
  }
  return result;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(syncMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
