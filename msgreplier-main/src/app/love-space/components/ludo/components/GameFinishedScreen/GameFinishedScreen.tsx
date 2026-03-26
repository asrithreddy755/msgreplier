import type { TPlayerNameAndColour, TPlayerColour } from '../../types';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, RotateCcw, Frown } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../state/store';
import styles from './GameFinishedScreen.module.css';

type Props = {
  playerFinishOrder: TPlayerNameAndColour[];
  myColour: TPlayerColour;
  onRestart?: () => void;
};

function GameFinishedScreen({ playerFinishOrder, myColour, onRestart }: Props) {
  const { width, height } = useWindowSize();
  const dispatch = useDispatch<AppDispatch>();

  const winner = playerFinishOrder[0];
  const isWinner = winner?.colour === myColour;

  const handleRestart = () => {
    if (onRestart) {
        onRestart();
    } else {
        // Fallback for standalone usage
        dispatch({ type: 'players/clearPlayersState' });
        dispatch({ type: 'dice/clearDiceState' });
        dispatch({ type: 'board/clearBoardState' });
        dispatch({ type: 'session/clearSessionState' });
    }
  };

  return (
    <AnimatePresence>
      <motion.div className={styles.gameFinishedScreen}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={styles.gameFinishedBackdrop}
        />
        {isWinner && <Confetti width={width} height={height} style={{ zIndex: 30 }} />}
        
        <motion.div
          className={styles.gameFinishedDialog}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className={isWinner ? styles.trophyContainer : styles.sadContainer}>
            {isWinner ? <Trophy className={styles.trophyIcon} /> : <Frown className={styles.sadIcon} />}
          </div>
          
          <h2 className={styles.winnerTitle}>
            {isWinner ? 'You win!' : `${winner?.name} wins!`}
          </h2>
          <p className={styles.congratsText}>
            {isWinner 
              ? 'Congratulations on winning the Ludo match! 🎉' 
              : 'Better luck next time! Your partner was just a bit faster. 🥺'}
          </p>

          <div className={styles.rankList}>
            {playerFinishOrder.map((p, i) => (
              <div key={i} className={styles.rankItem}>
                <span className={styles.rankBadge}>{i + 1}</span>
                <span className={styles.rankName}>{p.name} {p.colour === myColour && '(You)'}</span>
                {i === 0 && <span className={styles.winnerBadge}>Winner</span>}
              </div>
            ))}
          </div>

          <button onClick={handleRestart} className={styles.playAgainBtn}>
            Play Again <RotateCcw className="w-5 h-5 ml-2" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameFinishedScreen;
