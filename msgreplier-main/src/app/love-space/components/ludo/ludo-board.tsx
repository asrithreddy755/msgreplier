"use client";

import { LudoToken, PlayerColour, Coordinate } from './types';
import { TOKEN_PATHS, BOARD_SIZE, PLAYER_COLOURS, expandedHomeEntryPath } from './constants';
import { areCoordsEqual } from './game-logic';

interface LudoBoardProps {
    players: { nickname: string; colour: PlayerColour; tokens: LudoToken[] }[];
    currentTurn: PlayerColour | null;
    onTokenClick: (colour: PlayerColour, tokenId: number) => void;
    movableTokenIds: { colour: PlayerColour; id: number }[];
    isMyTurn: boolean;
}

function getTokenPosition(coord: Coordinate, boardSize: number) {
    const tileSize = boardSize / BOARD_SIZE;
    return {
        left: coord.x * tileSize + tileSize / 2,
        top: coord.y * tileSize + tileSize / 2,
    };
}

export function LudoBoard({ players, currentTurn, onTokenClick, movableTokenIds, isMyTurn }: LudoBoardProps) {
    const isMovable = (colour: PlayerColour, id: number) => {
        return movableTokenIds.some(t => t.colour === colour && t.id === id);
    };

    return (
        <div className="relative w-full aspect-square">
            {/* SVG Board Background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/ludo-board.svg"
                alt="Ludo Board"
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                draggable={false}
            />

            {/* Token Overlays */}
            {players.map(player =>
                player.tokens.map(token => {
                    if (token.hasReachedHome) return null;

                    const movable = isMovable(token.colour, token.id) && isMyTurn;
                    const pos = getTokenPosition(token.coordinates, 100); // percentage-based

                    return (
                        <button
                            key={`${token.colour}-${token.id}`}
                            onClick={() => movable ? onTokenClick(token.colour, token.id) : undefined}
                            disabled={!movable}
                            className={`
                absolute transform -translate-x-1/2 -translate-y-1/2 
                rounded-full border-2 border-white shadow-lg
                transition-all duration-300 ease-in-out
                ${movable ? 'animate-pulse cursor-pointer scale-110 z-30 ring-2 ring-white ring-offset-1' : 'z-20'}
                ${token.isLocked ? 'opacity-70' : 'opacity-100'}
              `}
                            style={{
                                left: `${pos.left}%`,
                                top: `${pos.top}%`,
                                width: `${100 / BOARD_SIZE * 0.7}%`,
                                height: `${100 / BOARD_SIZE * 0.7}%`,
                                backgroundColor: PLAYER_COLOURS[token.colour],
                                boxShadow: movable
                                    ? `0 0 12px ${PLAYER_COLOURS[token.colour]}88, 0 0 24px ${PLAYER_COLOURS[token.colour]}44`
                                    : `0 2px 6px rgba(0,0,0,0.3)`,
                            }}
                            title={`${player.nickname}'s piece ${token.id + 1}`}
                        >
                            <span className="text-white font-bold text-[8px] sm:text-[10px] flex items-center justify-center w-full h-full">
                                {token.id + 1}
                            </span>
                        </button>
                    );
                })
            )}
        </div>
    );
}
