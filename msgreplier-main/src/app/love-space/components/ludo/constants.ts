// Ludo board constants - ported from LibreLudo for 2-player (blue & green)
import { Coordinate, TokenPath, PlayerColour } from './types';

// The board is a 15x15 grid
export const BOARD_SIZE = 15;

// General token path around the board (shared by all colors, different start points)
export const GENERAL_TOKEN_PATH: TokenPath[] = [
    { startCoords: { x: 6, y: 13 }, endCoords: { x: 6, y: 9 } },
    { startCoords: { x: 5, y: 8 }, endCoords: { x: 1, y: 8 } },
    { startCoords: { x: 0, y: 8 }, endCoords: { x: 0, y: 6 } },
    { startCoords: { x: 1, y: 6 }, endCoords: { x: 5, y: 6 } },
    { startCoords: { x: 6, y: 5 }, endCoords: { x: 6, y: 1 } },
    { startCoords: { x: 6, y: 0 }, endCoords: { x: 8, y: 0 } },
    { startCoords: { x: 8, y: 1 }, endCoords: { x: 8, y: 5 } },
    { startCoords: { x: 9, y: 6 }, endCoords: { x: 13, y: 6 } },
    { startCoords: { x: 14, y: 6 }, endCoords: { x: 14, y: 8 } },
    { startCoords: { x: 13, y: 8 }, endCoords: { x: 9, y: 8 } },
    { startCoords: { x: 8, y: 9 }, endCoords: { x: 8, y: 13 } },
    { startCoords: { x: 8, y: 14 }, endCoords: { x: 6, y: 14 } },
];

// Home entry paths (the colored center paths)
export const TOKEN_HOME_ENTRY_PATH: Record<PlayerColour, TokenPath> = {
    blue: { startCoords: { x: 7, y: 13 }, endCoords: { x: 7, y: 8 } },
    green: { startCoords: { x: 7, y: 1 }, endCoords: { x: 7, y: 6 } },
};

// Start coordinates (where token goes after being unlocked)
export const TOKEN_START_COORDINATES: Record<PlayerColour, Coordinate> = {
    blue: { x: 6, y: 13 },
    green: { x: 8, y: 1 },
};

// Safe coordinates (can't be captured here)
export const TOKEN_SAFE_COORDINATES: Coordinate[] = [
    { x: 6, y: 13 }, // blue start
    { x: 8, y: 1 },  // green start
    { x: 1, y: 6 },  // red start (still safe zone on board)
    { x: 13, y: 8 }, // yellow start (still safe zone on board)
    { x: 8, y: 12 },
    { x: 2, y: 8 },
    { x: 6, y: 2 },
    { x: 12, y: 6 },
];

// Locked token positions (in the home bases)
export const TOKEN_LOCKED_COORDINATES: Record<PlayerColour, Coordinate[]> = {
    blue: [
        { x: 1.5, y: 10.2 },
        { x: 3.5, y: 10.2 },
        { x: 1.5, y: 12.2 },
        { x: 3.5, y: 12.2 },
    ],
    green: [
        { x: 10.5, y: 1.2 },
        { x: 12.5, y: 1.2 },
        { x: 10.5, y: 3.2 },
        { x: 12.5, y: 3.2 },
    ],
};

// Player colors for visual styling
export const PLAYER_COLOURS = {
    blue: '#1295e7',
    green: '#049645',
};

// Expand token path segments into individual coordinates
function getIntegersBetween(a: number, b: number): number[] {
    if (a === b) return [a];
    const result: number[] = [];
    const start = Math.min(a, b) + 1;
    const end = Math.max(a, b);
    for (let i = start; i < end; i++) result.push(i);
    if (a > b) result.reverse();
    return [a, ...result, b];
}

export function expandTokenPath(tokenPaths: TokenPath[]): Coordinate[] {
    const expandedPath: Coordinate[] = [];
    for (const path of tokenPaths) {
        const isVertical = path.startCoords.x === path.endCoords.x;
        const staticCoord = isVertical ? path.startCoords.x : path.startCoords.y;
        const varStart = isVertical ? path.startCoords.y : path.startCoords.x;
        const varEnd = isVertical ? path.endCoords.y : path.endCoords.x;
        const variableCoords = getIntegersBetween(varStart, varEnd);
        for (const v of variableCoords) {
            expandedPath.push(isVertical ? { x: staticCoord, y: v } : { x: v, y: staticCoord });
        }
    }
    return expandedPath;
}

// Pre-compute expanded paths
export const expandedHomeEntryPath: Record<PlayerColour, Coordinate[]> = {
    blue: expandTokenPath([TOKEN_HOME_ENTRY_PATH.blue]),
    green: expandTokenPath([TOKEN_HOME_ENTRY_PATH.green]),
};

function genBlueTokenPath(): Coordinate[] {
    const general = expandTokenPath(GENERAL_TOKEN_PATH).slice(0, -1);
    return [...general, ...expandedHomeEntryPath.blue];
}

function genGreenTokenPath(): Coordinate[] {
    const path = [...GENERAL_TOKEN_PATH.slice(6), ...GENERAL_TOKEN_PATH.slice(0, 6)];
    const expanded = expandTokenPath(path).slice(0, -1);
    return [...expanded, ...expandedHomeEntryPath.green];
}

export const TOKEN_PATHS: Record<PlayerColour, Coordinate[]> = {
    blue: genBlueTokenPath(),
    green: genGreenTokenPath(),
};

// Max consecutive sixes before penalty
export const MAX_CONSECUTIVE_SIXES = 3;
