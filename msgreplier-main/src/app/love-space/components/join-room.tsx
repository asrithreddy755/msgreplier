"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoom, LoveRoomMember } from '@/types/love-space';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Sparkles, UserPlus } from 'lucide-react';

interface JoinRoomProps {
    room: LoveRoom;
    onJoined: (member: LoveRoomMember) => void;
}

export function JoinRoom({ room, onJoined }: JoinRoomProps) {
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if the room already has 2 members
        const checkRoomFull = async () => {
            const { count } = await supabase
                .from('love_room_members')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id);

            if (count !== null && count >= 2) {
                setError("Room is full! Only 2 people allowed.");
            }
        };
        checkRoomFull();
    }, [room.id]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            setError("Please enter a nickname.");
            return;
        }

        if (error === "Room is full! Only 2 people allowed.") return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/love-space/join-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: room.id, nickname: nickname.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Error joining room.");
                setIsLoading(false);
                return;
            }

            if (data.member) {
                // Save joined state in localStorage to auto-rejoin upon refresh
                localStorage.setItem(`loveRoom_${room.id}`, JSON.stringify(data.member));
                onJoined(data.member as LoveRoomMember);
            }

        } catch (err: any) {
            console.error("Join Room API Error", err);
            setError("Failed to communicate with server.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex-col items-center justify-center p-4 h-full min-h-[500px] w-full border-0 absolute inset-0 z-10">
            <Card className="w-full max-w-sm shadow-xl border-pink-200">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-pink-500 shadow-inner">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                        Join Love Space
                    </CardTitle>
                    <CardDescription>
                        Enter a secret nickname to join this room.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <Input
                            placeholder="e.g. Honey, Pookie..."
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="text-center text-lg h-12 rounded-xl focus-visible:ring-pink-400"
                            maxLength={20}
                        />

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || error === "Room is full! Only 2 people allowed."}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md text-lg h-12 rounded-xl transition-transform hover:scale-105 active:scale-95"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Heart className="w-5 h-5 mr-2" />
                            )}
                            {isLoading ? "Joining..." : "Enter Room"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
