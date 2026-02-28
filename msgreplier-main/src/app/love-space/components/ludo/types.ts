// Simplified Ludo types for 2-player online Love Space

export type PlayerColour = 'blue' | 'green';

export type Coordinate = {
    x: number;
    y: number;
};

export type LudoToken = {
    id: number;
    colour: PlayerColour;
    coordinates: Coordinate;
    initialCoords: Coordinate;
    isLocked: boolean;
    hasReachedHome: boolean;
};

export type LudoPlayer = {
    nickname: string;
    colour: PlayerColour;
    tokens: LudoToken[];
};

export type LudoGameState = {
    players: LudoPlayer[];
    currentTurn: PlayerColour | null;
    diceValue: number | null;
    winner: string | null; // nickname
    lastAction: string | null;
    gameStarted: boolean;
};

export type TokenPath = {
    startCoords: Coordinate;
    endCoords: Coordinate;
};
