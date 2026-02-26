"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Loader2 } from 'lucide-react';

export default function LoveSpacePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creatorName, setCreatorName] = useState("");

    const createRoom = async () => {
        if (!creatorName.trim()) {
            setError("Please enter your name lovely!");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // First attempt: API Route (best for security and edge cases)
            const response = await fetch('/api/love-space/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ createdBy: creatorName }),
            });

            const data = await response.json();

            if (response.ok && data.room && data.room.id) {
                localStorage.setItem(`loveRoom_${data.room.id}`, JSON.stringify(data.member));
                router.push(`/love-space/${data.room.id}`);
                return;
            }

            throw new Error(data.error || "API Route failed.");

        } catch (apiErr: any) {
            console.warn("API route failed, falling back to direct Supabase call:", apiErr);

            // Fallback: Direct Supabase Call (handles Cloudflare Edge networking issues)
            try {
                const { data: room, error: insertError } = await supabase
                    .from('love_rooms')
                    .insert([{ status: 'active', created_by: creatorName.trim() }])
                    .select()
                    .single();

                if (insertError) throw new Error(insertError.message);
                if (!room) throw new Error("Failed to create room directly.");

                const { data: member, error: memberError } = await supabase
                    .from('love_room_members')
                    .insert([{ room_id: room.id, nickname: creatorName.trim() }])
                    .select()
                    .single();

                if (memberError) throw new Error(memberError.message);

                localStorage.setItem(`loveRoom_${room.id}`, JSON.stringify(member));
                router.push(`/love-space/${room.id}`);

            } catch (fallbackErr: any) {
                console.error("Direct Supabase fallback also failed:", fallbackErr);
                setError(fallbackErr.message || "Something went wrong.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-pink-950 dark:via-purple-950 dark:to-pink-950 flex flex-col items-center justify-center p-4">
            <div className="absolute top-10 left-10 text-pink-300 dark:text-pink-700 opacity-50 animate-pulse">
                <Heart size={48} />
            </div>
            <div className="absolute bottom-20 right-10 text-purple-300 dark:text-purple-700 opacity-50 animate-pulse delay-1000">
                <Sparkles size={48} />
            </div>

            <Card className="w-full max-w-md shadow-xl border-pink-200 dark:border-pink-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-pink-100 dark:bg-pink-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-pink-500 dark:text-pink-400 shadow-inner">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-400">
                        Love Space
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                        A private room for just the two of you. Play games, chat, and connect.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 pt-4">
                    <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        <p className="flex items-center justify-center gap-2">
                            <span className="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 rounded-full w-6 h-6 flex items-center justify-center font-bold">1</span>
                            Create a private room
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full w-6 h-6 flex items-center justify-center font-bold">2</span>
                            Share the secret link
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 rounded-full w-6 h-6 flex items-center justify-center font-bold">3</span>
                            Play, chat & bond in real-time
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm rounded-md text-center border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="creatorName" className="text-sm font-medium text-pink-700 dark:text-pink-300 ml-1">Your Nickname</label>
                        <input
                            id="creatorName"
                            type="text"
                            placeholder="e.g. Pookie, Hubby..."
                            value={creatorName}
                            onChange={(e) => setCreatorName(e.target.value)}
                            maxLength={20}
                            className="flex h-12 w-full rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-center font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                        />
                    </div>

                    <Button
                        onClick={createRoom}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md text-lg h-14 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        ) : (
                            <Heart className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? "Creating..." : "Create Love Space"}
                    </Button>
                </CardContent>
            </Card>

            <p className="mt-8 text-sm text-gray-400 dark:text-gray-500 text-center z-10">
                Rooms automatically expire after 24 hours.
            </p>
        </div>
    );
}
