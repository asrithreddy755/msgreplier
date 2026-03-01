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
    // Keep local board slice size if hydration tries to override it, it's view specific
    return {
      ...action.payload,
      board: { ...action.payload.board, boardSideLength: state?.board?.boardSideLength || 0, boardTileSize: state?.board?.boardTileSize || 0 }
    };
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
