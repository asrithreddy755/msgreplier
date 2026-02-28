// Pure game logic functions for Ludo - ported from LibreLudo
import { Coordinate, LudoToken, LudoPlayer, LudoGameState, PlayerColour } from './types';
import {
    TOKEN_PATHS,
    TOKEN_START_COORDINATES,
    TOKEN_SAFE_COORDINATES,
    TOKEN_LOCKED_COORDINATES,
    MAX_CONSECUTIVE_SIXES,
} from './constants';

// --- Coordinate helpers ---
export function areCoordsEqual(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
}

// --- Token creation ---
export function createTokens(colour: PlayerColour): LudoToken[] {
    return TOKEN_LOCKED_COORDINATES[colour].map((coords, i) => ({
        id: i,
        colour,
        coordinates: { ...coords },
        initialCoords: { ...coords },
        isLocked: true,
        hasReachedHome: false,
    }));
}

// --- Token path logic ---
function getTokenPathIndex(token: LudoToken): number {
    const path = TOKEN_PATHS[token.colour];
    return path.findIndex(c => areCoordsEqual(c, token.coordinates));
}

export function getAvailableSteps(token: LudoToken): number {
    const path = TOKEN_PATHS[token.colour];
    const idx = getTokenPathIndex(token);
    if (idx === -1) return 0;
    return path.length - 1 - idx;
}

export function canTokenMove(token: LudoToken, diceValue: number): boolean {
    if (token.hasReachedHome) return false;
    if (token.isLocked) return diceValue === 6;
    return getAvailableSteps(token) >= diceValue;
}

export function getFinalCoord(token: LudoToken, diceValue: number): Coordinate | null {
    if (token.isLocked) {
        return diceValue === 6 ? TOKEN_START_COORDINATES[token.colour] : null;
    }
    const path = TOKEN_PATHS[token.colour];
    const idx = getTokenPathIndex(token);
    if (idx === -1) return null;
    const finalIdx = idx + diceValue;
    if (finalIdx >= path.length) return null;
    return path[finalIdx];
}

export function isCoordSafe(coord: Coordinate): boolean {
    return TOKEN_SAFE_COORDINATES.some(c => areCoordsEqual(c, coord));
}

export function isInHomeEntry(coord: Coordinate, colour: PlayerColour): boolean {
    const path = TOKEN_PATHS[colour];
    // Home entry is roughly the last 6 tiles of the path
    const homeStart = path.length - 7;
    for (let i = homeStart; i < path.length; i++) {
        if (areCoordsEqual(path[i], coord)) return true;
    }
    return false;
}

// --- Game state helpers ---
export function createInitialState(): LudoGameState {
    return {
        players: [],
        currentTurn: null,
        diceValue: null,
        winner: null,
        lastAction: null,
        gameStarted: false,
    };
}

export function createPlayer(nickname: string, colour: PlayerColour): LudoPlayer {
    return {
        nickname,
        colour,
        tokens: createTokens(colour),
    };
}

export function hasPlayerWon(player: LudoPlayer): boolean {
    return player.tokens.every(t => t.hasReachedHome);
}

export function canPlayerMove(player: LudoPlayer, diceValue: number): boolean {
    return player.tokens.some(t => canTokenMove(t, diceValue));
}

export function getMovableTokens(player: LudoPlayer, diceValue: number): LudoToken[] {
    return player.tokens.filter(t => canTokenMove(t, diceValue));
}

// --- Core move logic ---
export type MoveResult = {
    newState: LudoGameState;
    captured: boolean;
    reachedHome: boolean;
    actionMessage: string;
};

export function moveToken(
    state: LudoGameState,
    colour: PlayerColour,
    tokenId: number,
    diceValue: number
): MoveResult {
    // Deep clone state
    const newState: LudoGameState = JSON.parse(JSON.stringify(state));
    const player = newState.players.find(p => p.colour === colour)!;
    const token = player.tokens.find(t => t.id === tokenId)!;
    const otherPlayer = newState.players.find(p => p.colour !== colour);

    let captured = false;
    let reachedHome = false;
    let actionMessage = '';

    if (token.isLocked && diceValue === 6) {
        // Unlock token
        token.isLocked = false;
        token.coordinates = { ...TOKEN_START_COORDINATES[colour] };
        actionMessage = `${player.nickname} unlocked a piece!`;
    } else if (!token.isLocked) {
        const finalCoord = getFinalCoord(token, diceValue);
        if (!finalCoord) {
            actionMessage = `${player.nickname} can't move this piece.`;
            return { newState: state, captured: false, reachedHome: false, actionMessage };
        }

        token.coordinates = { ...finalCoord };

        // Check if reached home (last position in path)
        const path = TOKEN_PATHS[colour];
        const homeCoord = path[path.length - 1];
        if (areCoordsEqual(finalCoord, homeCoord)) {
            token.hasReachedHome = true;
            token.isLocked = true;
            reachedHome = true;
            actionMessage = `${player.nickname}'s piece reached home! 🏠`;
        }

        // Check capture (only on non-safe tiles, not in home entry)
        if (!reachedHome && otherPlayer && !isCoordSafe(finalCoord) && !isInHomeEntry(finalCoord, colour)) {
            const capturedTokens = otherPlayer.tokens.filter(
                t => !t.isLocked && !t.hasReachedHome && areCoordsEqual(t.coordinates, finalCoord)
            );
            for (const ct of capturedTokens) {
                ct.isLocked = true;
                ct.coordinates = { ...ct.initialCoords };
                captured = true;
            }
            if (captured) {
                actionMessage = `${player.nickname} captured ${otherPlayer.nickname}'s piece! 💥`;
            }
        }

        if (!actionMessage) {
            actionMessage = `${player.nickname} moved a piece.`;
        }
    }

    // Check win
    if (hasPlayerWon(player)) {
        newState.winner = player.nickname;
        newState.currentTurn = null;
        actionMessage = `🎉 ${player.nickname} wins the game!`;
    }

    newState.diceValue = diceValue;
    newState.lastAction = actionMessage;

    return { newState, captured, reachedHome, actionMessage };
}

// Determine next turn
export function getNextTurn(
    state: LudoGameState,
    diceValue: number,
    captured: boolean,
    reachedHome: boolean,
    consecutiveSixes: number
): PlayerColour | null {
    if (state.winner) return null;

    const currentColour = state.currentTurn!;

    // Penalty for 3 consecutive sixes
    if (consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
        return currentColour === 'blue' ? 'green' : 'blue';
    }

    // Extra turn for rolling 6, capturing, or reaching home
    if (diceValue === 6 || captured || reachedHome) {
        return currentColour;
    }

    // Normal turn change
    return currentColour === 'blue' ? 'green' : 'blue';
}

// Roll dice (simple random 1-6)
export function rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
}
