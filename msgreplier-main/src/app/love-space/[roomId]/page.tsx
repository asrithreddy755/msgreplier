"use client";

export const runtime = 'edge';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveRoom, LoveRoomMember } from '@/types/love-space';
import { JoinRoom } from '../components/join-room';
import { Chat, XOX, TruthOrDare, SnakeLadder } from '../components/games';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Loader2, MessageSquareHeart, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DynamicRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // Use React.use() to unwrap the params promise (Next.js 15+ compatible way)
    const resolvedParams = use(params);
    const { roomId } = resolvedParams;

    const [room, setRoom] = useState<LoveRoom | null>(null);
    const [currentMember, setCurrentMember] = useState<LoveRoomMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/love-space/get-room?roomId=${roomId}`);
                const data = await response.json();

                if (response.ok && data.room) {
                    setRoom(data.room as LoveRoom);
                    checkSavedMember(roomId);
                    return;
                }
                throw new Error(data.error || "Room not found via API.");

            } catch (apiErr) {
                console.warn("API Error fetching room, falling back safely:", apiErr);

                try {
                    const { data, error: fetchError } = await supabase
                        .from('love_rooms')
                        .select('*')
                        .eq('id', roomId)
                        .single();

                    if (fetchError || !data) {
                        setError("Room not found or expired.");
                    } else {
                        setRoom(data as LoveRoom);
                        checkSavedMember(roomId);
                    }
                } catch (fallbackErr) {
                    console.error("Direct fetch failed:", fallbackErr);
                    setError("Failed to load room details.");
                }
            } finally {
                setLoading(false);
            }
        };

        // Helper function to handle local storage check after a successful room fetch
        const checkSavedMember = (id: string) => {
            const savedMember = localStorage.getItem(`loveRoom_${id}`);
            if (savedMember) {
                try {
                    const parsed = JSON.parse(savedMember) as LoveRoomMember;
                    setCurrentMember(parsed);
                } catch (e) {
                    console.error("Parse error:", e);
                }
            }
        };

        if (roomId) {
            fetchRoom();
        }
    }, [roomId]);

    const copyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4text-center">
                <Heart className="w-16 h-16 text-red-400 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold text-gray-800">Oops!</h1>
                <p className="text-gray-500 mt-2">{error || "Something went wrong."}</p>
                <Button onClick={() => window.location.href = '/love-space'} className="mt-6 bg-pink-500 hover:bg-pink-600 text-white">
                    Create a New Room
                </Button>
            </div>
        );
    }

    if (!currentMember) {
        return <JoinRoom room={room} onJoined={(m) => setCurrentMember(m)} />;
    }

    return (
        <div className="min-h-[100dvh] h-[100dvh] sm:h-[calc(100vh-2rem)] bg-gradient-to-b from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 flex flex-col overflow-hidden max-w-md mx-auto shadow-lg relative sm:my-4 sm:rounded-3xl sm:border sm:border-pink-200 dark:sm:border-pink-900/50">

            {/* Header Area */}
            <header className="px-4 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-pink-100 dark:border-pink-900/50 flex items-center justify-between z-20 sticky top-0">
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                    <h1 className="font-bold text-lg text-gray-800 dark:text-pink-100 tracking-tight">Love Space</h1>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="text-xs h-8 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-full px-3"
                >
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? "Copied" : "Invite"}
                </Button>
            </header>

            {/* Main Content Area Using Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col z-10 w-full">
                <Tabs defaultValue="chat" className="flex-1 flex flex-col h-full w-full">
                    <TabsList className="grid grid-cols-4 w-full bg-white/40 dark:bg-slate-900/40 p-1 mx-0 sm:mx-4 my-2 rounded-none sm:rounded-xl backdrop-blur-sm self-center sm:w-[calc(100%-2rem)] h-12 border-y sm:border border-pink-100 dark:border-pink-900/50 shadow-sm overflow-x-auto hide-scrollbar flex-shrink-0">
                        <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-pink-500 data-[state=active]:text-white text-xs whitespace-nowrap px-2">Chat</TabsTrigger>
                        <TabsTrigger value="xox" className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white text-xs whitespace-nowrap px-2">XOX</TabsTrigger>
                        <TabsTrigger value="truth" className="rounded-lg data-[state=active]:bg-rose-500 data-[state=active]:text-white text-xs whitespace-nowrap px-2">Truth/Dare</TabsTrigger>
                        <TabsTrigger value="snake" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs whitespace-nowrap px-2">Snake</TabsTrigger>
                    </TabsList>


                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        <TabsContent value="chat" className="flex-1 h-full mt-0 data-[state=inactive]:hidden px-0 sm:px-4 pb-0 sm:pb-4 flex flex-col">
                            <div className="flex-1 h-full bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl shadow-inner border-t sm:border border-pink-100 dark:border-pink-900/50 flex flex-col overflow-hidden">
                                <Chat roomId={roomId} currentMember={currentMember} />
                            </div>
                        </TabsContent>
                        <TabsContent value="xox" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-purple-100 dark:border-purple-900/50 overflow-hidden flex items-center justify-center">
                                <XOX roomId={roomId} currentMember={currentMember} />
                            </div>
                        </TabsContent>
                        <TabsContent value="truth" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-rose-100 dark:border-rose-900/50 overflow-hidden flex items-center justify-center p-4">
                                <TruthOrDare roomId={roomId} currentMember={currentMember} />
                            </div>
                        </TabsContent>
                        <TabsContent value="snake" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-orange-100 dark:border-orange-900/50 overflow-hidden flex items-center justify-center p-4 overflow-y-auto">
                                <SnakeLadder roomId={roomId} currentMember={currentMember} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
       `}} />
        </div>
    );
}
