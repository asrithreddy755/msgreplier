"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Sparkles, Loader2, Copy, Share2, CheckCircle2, ArrowRight, UserPlus, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

// Metadata is handled by a separate layout or generateMetadata in server components, 
// but since this is a 'use client' file, we can't export metadata here directly.
// However, the parent layout/sitemap will handle the SEO.

export default function LoveSpacePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [creatorName, setCreatorName] = useState("");

    // OTP State
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 4) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const joinByCode = async () => {
        const code = otp.join('');
        if (code.length !== 5) {
            setJoinError("Please enter a valid 5-digit code.");
            return;
        }

        setIsJoining(true);
        setJoinError(null);

        try {
            const response = await fetch(`/api/love-space/join-by-code?code=${code}`);
            const data = await response.json();

            if (response.ok && data.roomId) {
                router.push(`/love-space/${data.roomId}`);
            } else {
                setJoinError(data.error || "No active room found. Check the code and try again.");
            }
        } catch (err) {
            setJoinError("Something went wrong. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    // Modal State
    const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
    const [createdRoomUrl, setCreatedRoomUrl] = useState<string>("");
    const [createdRoomCode, setCreatedRoomCode] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

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

            sessionStorage.setItem(`loveRoom_${data.room.id}`, JSON.stringify({ ...data.member, isCreator: true }));
            localStorage.setItem(`loveRoom_${data.room.id}`, JSON.stringify({ ...data.member, isCreator: true }));
            const url = `${window.location.origin}/love-space/${data.room.id}`;
            setCreatedRoomUrl(url);
            setCreatedRoomId(data.room.id);
            setCreatedRoomCode(data.room.room_code);
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
                        {/* Room Code Display */}
                        <div className="flex flex-col items-center gap-2 p-4 bg-pink-50/50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 dark:text-pink-400">Your Room Code</span>
                            <div className="flex gap-2">
                                {createdRoomCode.split('').map((digit, i) => (
                                    <div key={i} className="w-10 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-pink-100 dark:border-pink-900/50 shadow-sm">
                                        <span className="text-2xl font-black font-mono text-pink-600 dark:text-pink-400">{digit}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-7 text-[10px] font-bold text-pink-500 hover:bg-pink-100/50"
                                onClick={() => {
                                    navigator.clipboard.writeText(createdRoomCode);
                                    setCopiedCode(true);
                                    toast.success("Room code copied!");
                                    setTimeout(() => setCopiedCode(false), 2000);
                                }}
                            >
                                {copiedCode ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                {copiedCode ? "Code Copied" : "Copy Code"}
                            </Button>
                        </div>

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
                <div className="flex flex-col gap-6 w-full max-w-md z-20">
                    {/* Create Room Card */}
                    <Card className="shadow-2xl border-pink-200/60 dark:border-pink-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400" />
                        <CardHeader className="text-center pb-3 pt-6">
                            {/* Icon */}
                            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
                                <Heart className="w-7 h-7 text-white fill-white" />
                            </div>
                            <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                                Create a New Room
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Your private space is ready in seconds
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 px-6 pb-6">
                            {/* Feature pills */}
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl px-4 py-2.5 border border-pink-100 dark:border-pink-900/30">
                                    <span className="text-lg leading-none">💬</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Private real-time chat — just the two of you</span>
                                </div>
                                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-2.5 border border-purple-100 dark:border-purple-900/30">
                                    <span className="text-lg leading-none">🎮</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Play Ludo, Tic Tac Toe &amp; Snake together</span>
                                </div>
                                <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl px-4 py-2.5 border border-rose-100 dark:border-rose-900/30">
                                    <span className="text-lg leading-none">🔒</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No login needed — auto-deletes after 24 hours</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white dark:bg-slate-900 px-3 text-gray-400 font-medium uppercase tracking-widest">Your nickname</span>
                                </div>
                            </div>

                            {/* Input + Button */}
                            <div className="space-y-3">
                                <Input
                                    placeholder="e.g. Romeo 🌹"
                                    value={creatorName}
                                    onChange={(e) => setCreatorName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && createRoom()}
                                    maxLength={20}
                                    className="h-12 rounded-xl border-pink-200 dark:border-pink-900/50 focus-visible:ring-pink-500 text-base placeholder:text-gray-400"
                                />
                                {error && <p className="text-xs text-red-500 font-medium px-1">{error}</p>}
                                <Button
                                    onClick={createRoom}
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl font-bold text-base shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <Heart className="w-5 h-5 mr-2 fill-white" />
                                    )}
                                    {isLoading ? "Creating your space…" : "Create Love Space"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Join with Code Card */}
                    <Card className="shadow-xl border-purple-100 dark:border-purple-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Join with Code</CardTitle>
                            <CardDescription>Enter the 5-digit code from your partner</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-black font-mono bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                ))}
                            </div>
                            {joinError && <p className="text-xs text-red-500 font-medium text-center">{joinError}</p>}
                            <Button
                                onClick={joinByCode}
                                disabled={isJoining}
                                variant="outline"
                                className="w-full h-12 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl font-bold transition-all active:scale-95"
                            >
                                {isJoining ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <UserPlus className="w-5 h-5 mr-2" />
                                )}
                                {isJoining ? "Joining..." : "Join Room"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
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

                {/* Content + Use-cases Section */}
                <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 dark:border-pink-900/30 shadow-sm text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-pink-100 mb-4">The Ultimate Private Space for Couples</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Love-Space is a secure, real-time platform designed specifically for couples to bond. Whether you're in a long-distance relationship or just looking for a private digital corner, our rooms provide everything you need to connect instantly.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                            <h3 className="font-bold text-pink-600 dark:text-pink-400 mb-1">Private Chat Rooms</h3>
                            <p className="text-gray-500 dark:text-gray-400">Encrypted, real-time messaging with no logs and automatic deletion.</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <h3 className="font-bold text-purple-600 dark:text-purple-400 mb-1">Interactive Games</h3>
                            <p className="text-gray-500 dark:text-gray-400">Play classic games like Ludo, Tic Tac Toe, and Snake & Ladder together.</p>
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
