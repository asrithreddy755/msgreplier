import React, { useEffect, useRef } from 'react';
import { registerNewPlayer, setPlayerSequence } from '../../state/slices/playersSlice';
import { type TPlayerColour } from '../../types';
import Board from '../Board/Board';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../state/store';
import { registerDice } from '../../state/slices/diceSlice';
import { handlePostDiceRollThunk } from '../../state/thunks/handlePostDiceRollThunk';
import GameFinishedScreen from '../GameFinishedScreen/GameFinishedScreen';
import { changeTurnThunk } from '../../state/thunks/changeTurnThunk';
import { useMoveAndCaptureToken } from '../../hooks/useMoveAndCaptureToken';
import type { TPlayerInitData } from '../../types';
import { useRouter } from 'next/navigation';
import { playerCountToWord } from '../../game/players/logic';
import bg from '../../assets/bg.jpg';
import { usePageLeaveBlocker } from '../../hooks/usePageLeaveBlocker';
import { addToGameInactiveTime, setGameStartTime } from '../../state/slices/sessionSlice';
import Dice from '../Dice/Dice';
import styles from './Game.module.css';

export const EXIT_MESSAGE = 'Are you sure you want to exit? Any progress made will be lost.';

type Props = {
  initData: TPlayerInitData[];
  myColour: TPlayerColour;
};

function Game({ initData, myColour }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const boardTileSize = useSelector((state: RootState) => state.board.boardTileSize);
  const { playerSequence, isGameEnded, playerFinishOrder, currentPlayerColour, players } =
    useSelector((state: RootState) => state.players);
  const { dice } = useSelector((state: RootState) => state.dice);
  const playersRegisteredInitiallyRef = useRef(true);
  const gameInactiveStartTime = useRef(0);
  const router = useRouter();
  const moveAndCapture = useMoveAndCaptureToken();
  usePageLeaveBlocker(!isGameEnded && process.env.NODE_ENV === 'production');
  useEffect(() => {
    if (initData.length === 0) return;
    dispatch(setPlayerSequence({ playerCount: playerCountToWord(initData.length) }));
    dispatch(setGameStartTime(Date.now()));
  }, [dispatch, initData.length]);

  useEffect(() => {
    if (initData.length === 0) return;
    for (let i = 0; i < initData.length; i++) {
      if (!playerSequence.length || !playersRegisteredInitiallyRef.current) return;
      dispatch(
        registerNewPlayer({
          name: initData[i].name,
          colour: playerSequence[i],
          isBot: initData[i].isBot,
        })
      );
      dispatch(registerDice(playerSequence[i]));
    }
    playersRegisteredInitiallyRef.current = false;
  }, [dispatch, playerSequence, initData]);

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      if (isGameEnded) return;
      if (document.hidden) {
        gameInactiveStartTime.current = Date.now();
      } else {
        const now = Date.now();
        dispatch(addToGameInactiveTime(now - gameInactiveStartTime.current));
      }
    };
    document.addEventListener('visibilitychange', handlePageVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handlePageVisibilityChange);
  }, [dispatch, isGameEnded]);

  useEffect(() => {
    if (currentPlayerColour || players.length === 0 || initData.length === 0) return;
    dispatch(changeTurnThunk(moveAndCapture));
  }, [currentPlayerColour, dispatch, initData.length, moveAndCapture, players.length]);

  const handleDiceRoll = (colour: TPlayerColour, diceNumber: number) => {
    if (initData.length === 0) return;
    dispatch(handlePostDiceRollThunk(colour, diceNumber, moveAndCapture));
  };

  const handleExitBtnClick = () => router.push('/');

  return (
    <div className="relative w-full max-w-[600px] mx-auto flex flex-col items-center justify-center gap-4 py-4" style={{ '--board-tile-size': `${boardTileSize}px` } as React.CSSProperties}>

      {/* Board Container */}
      <div className="relative w-full aspect-square bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900/50 overflow-hidden">
        <Board myColour={myColour} />
      </div>

      {/* The Locked-in Dice Container */}
      <div className="mt-2 sm:mt-4 p-4 min-w-[200px] w-full bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 z-10 flex flex-wrap justify-center items-center gap-4">
        {dice.map((d: any) => (
          <Dice
            colour={d.colour}
            myColour={myColour}
            onDiceClick={handleDiceRoll}
            playerName={players.find((p: any) => p.colour === d.colour)?.name as string}
            key={d.colour}
          />
        ))}
      </div>

      {isGameEnded && <GameFinishedScreen playerFinishOrder={playerFinishOrder} />}
    </div>
  );
}

export default Game;
