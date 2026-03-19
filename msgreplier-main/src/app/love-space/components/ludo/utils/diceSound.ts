import { getIsMuted } from '../../../hooks/useAudioMute';

/**
 * Shared dice-roll sound utility.
 * The Audio object is created once at module load time so it is
 * pre-buffered and ready to play with zero latency on the first click.
 */
const diceAudio =
  typeof window !== 'undefined' ? new Audio('/dice-roll.mp3') : null;

if (diceAudio) {
  diceAudio.preload = 'auto';
}

/**
 * Play the dice-roll sound effect.
 * Resets `currentTime` to 0 before playing so rapid clicks never overlap.
 * If the audio file is missing or autoplay is blocked, the error is silently ignored.
 */
export function playDiceSound(): void {
  if (!diceAudio || getIsMuted()) return;
  diceAudio.currentTime = 0;
  diceAudio.play().catch(() => {
    // Ignore: file missing or browser autoplay policy
  });
}
