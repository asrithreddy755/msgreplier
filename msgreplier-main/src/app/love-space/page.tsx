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
                            <span className="flex-1 text-sm text-gray-500 dark:text-gray-400 break-all px-2">
                                {createdRoomUrl}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-100 dark:hover:bg-slate-700 shrink-0"
                                onClick={() => {
                                    navigator.clipboard.writeText(createdRoomUrl);
                                    setCopied(true);
                                    toast.success("Invite link copied!");
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md h-12 rounded-xl text-sm sm:text-base flex items-center justify-center"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Join our Love Space 💖',
                                            text: 'I created a private space for us to play games and chat! Join here:',
                                            url: createdRoomUrl
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(createdRoomUrl);
                                        setCopied(true);
                                        toast.success("Invite link copied!");
                                        setTimeout(() => setCopied(false), 2000);
                                    }
                                }}
                            >
                                <Heart className="w-4 h-4 mr-2" />
                                {copied ? "Link Copied" : "Invite Partner"}
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

            <div className="mt-12 w-full max-w-2xl px-4 z-10 space-y-8 pb-8 text-center sm:text-left">
                {/* Highlight Badge */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-green-500/20 text-sm sm:text-base animate-in zoom-in">
                        <CheckCircle2 className="w-5 h-5 text-green-100" />
                        100% Private & No Login Required
                    </div>
                </div>

                {/* Uses & Features */}
                <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 dark:border-pink-900/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 dark:bg-pink-900/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-pink-100 mb-4 flex items-center justify-center sm:justify-start gap-2 relative z-10">
                        <Sparkles className="w-5 h-5 text-purple-500" /> Why Use Love Space?
                    </h2>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-3 text-sm sm:text-base list-none relative z-10">
                        <li className="flex items-start gap-3">
                            <span className="bg-pink-100 dark:bg-pink-900/40 text-pink-500 p-1 rounded-full mt-0.5"><Heart className="w-3 h-3 fill-current" /></span>
                            <span><strong>Instant Connection:</strong> A beautifully crafted, temporary private room for you and your partner.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-500 p-1 rounded-full mt-0.5"><CheckCircle2 className="w-3 h-3" /></span>
                            <span><strong>Zero Friction:</strong> No accounts, no emails, no passwords. Just enter a nickname and share the link.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-500 p-1 rounded-full mt-0.5"><Sparkles className="w-3 h-3" /></span>
                            <span><strong>Live Status:</strong> See exactly when your partner is online, typing, or playing a game.</span>
                        </li>
                    </ul>
                </section>

                {/* Games Container */}
                <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 dark:border-pink-900/30 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-pink-100 mb-5 flex items-center justify-center sm:justify-start gap-2">
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Play Together
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm border border-pink-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
                            <span className="text-2xl mb-2 block animate-bounce" style={{ animationDuration: '2s' }}>💬</span>
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Live Chat</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm border border-purple-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
                            <span className="text-2xl mb-2 block animate-pulse">⭕</span>
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Tic Tac Toe</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm border border-emerald-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
                            <span className="text-2xl mb-2 block animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🎲</span>
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Ludo</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm border border-orange-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
                            <span className="text-2xl mb-2 block animate-pulse" style={{ animationDelay: '1s' }}>🐍</span>
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Snake</span>
                        </div>
                    </div>
                </section>

                {/* Privacy and Terms */}
                <section className="bg-white/30 dark:bg-slate-900/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-base">Privacy Policy & Terms of Use</h3>
                    <div className="space-y-3">
                        <p>
                            <strong className="text-gray-600 dark:text-gray-300">Total Privacy:</strong> We strictly do not ask for any personal information. All messages, nicknames, and game data are strictly confined to your temporary room environment.
                        </p>
                        <p>
                            <strong className="text-gray-600 dark:text-gray-300">Terms of Use:</strong> This service is provided loosely {"\"as is\""} and is designed exclusively for fun and lighthearted entertainment. Love Rooms and absolutely all their contents are automatically and irretrievably <strong>deleted after 24 hours</strong>, or after 10 minutes of complete inactivity by both partners. Please do not use this space to share sensitive personal information.
                        </p>
                    </div>
                </section>
            </div>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-600 text-center z-10 pb-8 uppercase tracking-widest font-semibold opacity-70">
                Rooms automatically expire after 24 hours of creation.
            </p>
        </div>
    );
}
