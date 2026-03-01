"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Loader2, Copy, Share2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoveSpacePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creatorName, setCreatorName] = useState("");

    // Modal State
    const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
    const [createdRoomUrl, setCreatedRoomUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const createRoom = async () => {
        if (!creatorName.trim()) {
            setError("Please enter your name lovely!");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/love-space/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ createdBy: creatorName }),
            });

            const data = await response.json();

            if (!response.ok || !data.room || !data.room.id) {
                throw new Error(data.error || "Failed to create room.");
            }

            localStorage.setItem(`loveRoom_${data.room.id}`, JSON.stringify(data.member));
            const url = `${window.location.origin}/love-space/${data.room.id}`;
            setCreatedRoomUrl(url);
            setCreatedRoomId(data.room.id);
        } catch (apiErr: any) {
            setError(apiErr.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-pink-950 dark:via-purple-950 dark:to-pink-950 flex flex-col items-center justify-center p-4">
            <div className="absolute top-10 left-10 text-pink-300 dark:text-pink-700 opacity-50 animate-pulse">
                <Heart size={48} className="fill-pink-200/50 dark:fill-pink-900/30" />
            </div>
            <div className="absolute bottom-20 right-10 text-purple-300 dark:text-purple-700 opacity-50 animate-pulse delay-1000">
                <Sparkles size={48} />
            </div>
            {/* Additional romantic floating elements */}
            <div className="absolute top-40 right-20 text-rose-300 dark:text-rose-800 opacity-40 animate-bounce" style={{ animationDuration: '3s' }}>
                <Heart size={32} className="fill-rose-200/50 dark:fill-rose-900/30" />
            </div>
            <div className="absolute bottom-40 left-16 text-pink-400 dark:text-pink-600 opacity-30 animate-pulse delay-500">
                <Heart size={24} className="rotate-12 fill-pink-300/50 dark:fill-pink-800/30" />
            </div>
            <div className="absolute top-1/2 left-8 text-purple-300 dark:text-purple-800 opacity-20 animate-bounce" style={{ animationDuration: '4s' }}>
                <Sparkles size={24} />
            </div>

            {createdRoomId ? (
                <Card className="w-full max-w-md shadow-2xl border-pink-300 dark:border-pink-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 overflow-hidden relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-10 -right-10 text-pink-500/10 dark:text-pink-900/30">
                        <Heart className="w-40 h-40 fill-current" />
                    </div>

                    <CardHeader className="text-center pt-8 pb-2">
                        <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Room Created!
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-lg mt-2 px-4">
                            Your Love Space is ready. Invite your partner using the link below before entering.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4 mt-6">
                        <div className="flex items-center gap-2 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 p-3 rounded-xl overflow-hidden shadow-inner">
                            <span className="flex-1 text-sm text-gray-500 dark:text-gray-400 truncate select-all px-2">
                                {createdRoomUrl}
                            </span>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(createdRoomUrl);
                                    setCopied(true);
                                    toast.success("Link copied! Ready to send.");
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 bg-white dark:bg-slate-700 hover:bg-pink-100 dark:hover:bg-slate-600 text-pink-600 dark:text-pink-300 shadow-sm"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-pink-200 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 h-12 rounded-xl"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Join our Love Space 💖',
                                            text: 'I created a private space for us to play games and chat! Join here:',
                                            url: createdRoomUrl
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(createdRoomUrl);
                                        toast.success("Link copied!");
                                    }
                                }}
                            >
                                <Share2 className="w-4 h-4 mr-2 text-pink-500" />
                                Share Link
                            </Button>
                        </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                        <Button
                            onClick={() => router.push(`/love-space/${createdRoomId}`)}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/30 text-lg h-14 rounded-xl transition-all hover:scale-[1.02] active:scale-95 group"
                        >
                            Enter Love Space
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
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
            )}

            <p className="mt-8 text-sm text-gray-400 dark:text-gray-500 text-center z-10">
                Rooms automatically expire after 24 hours.
            </p>
        </div>
    );
}
