// @ts-nocheck
import {
  activateTokens,
  deactivateAllTokens,
  incrementNumberOfConsecutiveSix,
  resetNumberOfConsecutiveSix,
} from '../slices/playersSlice';
import { type TPlayerColour } from '../../types';
import type { AppDispatch, RootState } from '../store';
import { store, startTurn, commitTurn } from '../store';
import { areCoordsEqual } from '../../game/coords/logic';
import { changeTurnThunk } from './changeTurnThunk';
import type { useMoveAndCaptureToken } from '../../hooks/useMoveAndCaptureToken';
import type { TMoveData } from '../../types/tokens';
import { sleep } from '../../utils/sleep';
import { isAnyTokenActiveOfColour, isTokenMovable } from '../../game/tokens/logic';

export const handlePostDiceRollThunk = (
  colour: TPlayerColour,
  diceNumber: number,
  moveAndCapture: ReturnType<typeof useMoveAndCaptureToken>
) => {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<{ shouldContinue: boolean; moveData: TMoveData | null } | null> => {
    if (getState().players.isGameEnded) return null;

    // Mute all intermediate Redux writes for the duration of this turn.
    // changeTurnThunk() will do its own startTurn/commitTurn with the final authoritative state.
    startTurn();

    if (diceNumber === 6) dispatch(incrementNumberOfConsecutiveSix(colour));
    else dispatch(resetNumberOfConsecutiveSix(colour));

    dispatch(activateTokens({ all: diceNumber === 6, colour, diceNumber }));
    const players = getState().players.players;
    const player = players.find((p) => p.colour === colour);
    if (!player) return null;

    if (player.numberOfConsecutiveSix === 3) {
      dispatch(resetNumberOfConsecutiveSix(colour));
      dispatch(deactivateAllTokens(colour));
      if (player.isBot) await sleep(500);
      // changeTurnThunk handles its own commit with the new currentPlayerColour
      dispatch(changeTurnThunk(moveAndCapture));
      return { moveData: null, shouldContinue: false };
    }

    const areUnlockableTokensPresent =
      diceNumber === 6 && player.tokens.some((t) => areCoordsEqual(t.coordinates, t.initialCoords));

    if (areUnlockableTokensPresent) {
      commitTurn(store);
      return { shouldContinue: true, moveData: null };
    }

    const movableTokens = player.tokens.filter((t) => isTokenMovable(t, diceNumber));

    const areAllTokensInSameCoord =
      movableTokens.length === 0
        ? false
        : movableTokens.every((t) => areCoordsEqual(movableTokens[0].coordinates, t.coordinates));

    if (areAllTokensInSameCoord) {
      const moveData = await moveAndCapture(movableTokens[0], diceNumber);
      dispatch(deactivateAllTokens(colour));
      if (!moveData) {
        if (player.isBot) await sleep(500);
        if (diceNumber !== 6) {
          // changeTurnThunk handles commit atomically
          dispatch(changeTurnThunk(moveAndCapture));
        } else {
          commitTurn(store);
        }
        return { shouldContinue: diceNumber === 6, moveData };
      }
      const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
      if (hasPlayerWon) {
        dispatch(changeTurnThunk(moveAndCapture));
        return { shouldContinue: false, moveData: null };
      }
      if (!hasTokenReachedHome && !isCaptured && diceNumber !== 6 && !player.isBot) {
        dispatch(changeTurnThunk(moveAndCapture));
        return { shouldContinue: false, moveData: null };
      }
      commitTurn(store);
      return { shouldContinue: true, moveData };
    }
    if (!isAnyTokenActiveOfColour(colour, players)) {
      if (player.isBot) await sleep(500);
      if (diceNumber !== 6) {
        dispatch(changeTurnThunk(moveAndCapture));
      } else {
        commitTurn(store);
      }
      return { shouldContinue: diceNumber === 6, moveData: null };
    }
    commitTurn(store);
    return { shouldContinue: true, moveData: null };
  };
};

