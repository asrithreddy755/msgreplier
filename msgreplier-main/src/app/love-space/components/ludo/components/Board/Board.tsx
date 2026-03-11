// @ts-nocheck
import BoardImageRaw from '../../assets/board.svg?react';
const BoardImage = (BoardImageRaw as any).default || BoardImageRaw;
import Token from '../Token/Token';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../state/store';
import { useEffect, useRef, useState } from 'react';
import { NUMBER_OF_BLOCKS_IN_ONE_ROW, resizeBoard } from '../../state/slices/boardSlice';
import { ERRORS } from '../../utils/errors';
import type { TCoordinate } from '../../types';
import { getTokenDOMId, tokensWithCoord } from '../../game/tokens/logic';
import type { TTokenClickData } from '../../types/tokens';
import styles from './Board.module.css';
import type { TPlayerColour } from '../../types';

function Board({ myColour }: { myColour: TPlayerColour }) {
  const { players, currentPlayerColour } = useSelector((state: RootState) => state.players);
  const { boardTileSize, boardSideLength } = useSelector((state: RootState) => state.board);
  const [tokenClickData, setTokenClickData] = useState<TTokenClickData | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        const boardSideLength = boardNode.getBoundingClientRect().width;
        dispatch(resizeBoard(boardSideLength));
      });
    }
    const resizeObserver = resizeObserverRef.current;
    // Set initial sizes immediately to ensure tokens are placed correctly before the first resize event
    dispatch(resizeBoard(boardNode.getBoundingClientRect().width));
    resizeObserver.observe(boardNode);
    return () => {
      resizeObserver.unobserve(boardNode);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  const handleBoardClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!currentPlayerColour || currentPlayerColour !== myColour) return;
    if (players.find((p) => p.colour === currentPlayerColour)?.isBot) return;
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    const { top, left } = boardNode.getBoundingClientRect();
    const boardX = e.clientX - left;
    const boardY = e.clientY - top;
    const tileStartCoords = Array(NUMBER_OF_BLOCKS_IN_ONE_ROW)
      .fill(null)
      .map((_, i) => (i + 1) * boardTileSize);

    if (boardX > boardSideLength || boardY > boardSideLength || boardX < 0 || boardY < 0) return;

    const coordX = tileStartCoords.findIndex((v) => boardX < v);
    const coordY = tileStartCoords.findIndex((v) => boardY < v);

    const coords: TCoordinate = { x: coordX, y: coordY };

    const tokenToMove = tokensWithCoord(coords, players).filter(
      (t) => t.colour === currentPlayerColour
    )[0];

    if (!tokenToMove || tokenToMove.isLocked) return;

    setTokenClickData({
      timestamp: Date.now(),
      colour: tokenToMove.colour,
      id: tokenToMove.id,
    });
  };

  return (
    <div className={styles.board} ref={boardRef} onClick={handleBoardClick}>
      {players.map((p) =>
        p.tokens.map((t) => (
          <Token
            colour={t.colour}
            myColour={myColour}
            id={t.id}
            tokenClickData={tokenClickData}
            key={getTokenDOMId(t.colour, t.id)}
          />
        ))
      )}
      <BoardImage className={styles.boardImage} aria-hidden="true" />
    </div>
  );
}

export default Board;
