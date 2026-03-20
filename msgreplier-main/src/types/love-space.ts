export type RoomStatus = 'active' | 'expired';

export interface LoveRoom {
    id: string;
    created_at: string;
    status: RoomStatus;
    expires_at: string;
}

export interface LoveRoomMember {
    id: string;
    room_id: string;
    nickname: string;
    joined_at: string;
}

export interface LoveMessage {
    id: string;
    room_id: string;
    sender_nickname: string;
    message: string;
    created_at: string;
}

// Games
export type GameType = 'xox' | 'ludo' | 'snake';

export interface LoveGame {
    id: string;
    room_id: string;
    game_type: GameType;
    game_state: any;
    updated_at: string;
}

// XOX Component State
export type XOXPlayer = 'X' | 'O' | null;
export interface XOXGameState {
    board: XOXPlayer[];
    currentTurn: 'X' | 'O';
    winner: 'X' | 'O' | 'Draw' | null;
    scores?: { X: number; O: number };
    roundStarter?: 'X' | 'O';
    version: number;
    updatedAt: number;
}

// Ludo State — defined in src/app/love-space/components/ludo/types.ts

// Snake and Ladder State
export interface SnakeLadderState {
    player1Position: number;
    player2Position: number;
    currentTurn: string | null; // Nickname
    winner: string | null;
    lastActionMessage?: string | null;
    lastPath?: number[];
    lastPathPlayer?: number;
    lastRollValue?: number;
    version: number;
    updatedAt: number;
}

// Sync Payload for Broadcast
export interface GameSyncPayload {
    type: GameType;
    state: any;
}

// Love Quiz Types
export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
}

export interface LoveQuiz {
    id: string;
    room_id: string;
    creator_id: string; // Member ID who created the quiz
    taker_id?: string; // Member ID who takes the quiz (initially undefined)
    title: string;
    questions: QuizQuestion[];
    score: number | null; // Null if not taken yet
    status: 'pending' | 'completed';
    created_at: string;
    taker_answers?: number[]; // Array of selected option indices
}
