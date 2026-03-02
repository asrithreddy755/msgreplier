"use client";

export const runtime = 'edge';

import { useEffect, useState, use, useRef } from 'react';
import { LoveRoom, LoveRoomMember } from '@/types/love-space';
import { JoinRoom } from '../components/join-room';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Chat, XOX, Ludo, SnakeLadder } from '../components/games';
import { LoveQuiz } from '../components/love-quiz';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Loader2, MessageSquareHeart, Copy, CheckCircle2, Home, Gamepad2, Dices, Grid3X3, Flag, ArrowLeft, MessageCircle } from 'lucide-react';
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

    // Presence & Notification State
    const [activeTab, setActiveTab] = useState('home');
    const [otherMemberTab, setOtherMemberTab] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showGameChat, setShowGameChat] = useState(false);
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
    const [networkQuality, setNetworkQuality] = useState<'good' | 'fair' | 'poor'>('good');
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Monitor network quality
    useEffect(() => {
        const updateNetworkStatus = () => {
            const nav = window.navigator as any;
            if (nav.connection) {
                const conn = nav.connection;
                if (conn.rtt > 500 || conn.downlink < 1) setNetworkQuality('poor');
                else if (conn.rtt > 150 || conn.downlink < 5) setNetworkQuality('fair');
                else setNetworkQuality('good');
            }
        };
        updateNetworkStatus();
        if ((window.navigator as any).connection) {
            (window.navigator as any).connection.addEventListener('change', updateNetworkStatus);
        }
        return () => {
            if ((window.navigator as any).connection) {
                (window.navigator as any).connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, []);

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

                setError("Room not found or expired.");
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

    // Handle Presence Channel
    useEffect(() => {
        if (!currentMember || !roomId) return;

        const channel = supabase.channel(`room_presence:${roomId}`, {
            config: {
                presence: {
                    key: currentMember.id,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const presenceState = channel.presenceState();

                // Find the other member's state directly
                let otherTab = null;
                const online = new Set<string>();
                let hasNewMembers = false;

                for (const key in presenceState) {
                    const stateGroup = presenceState[key] as any[];
                    if (stateGroup && stateGroup.length > 0) {
                        online.add(key);
                        if (key !== currentMember.id) {
                            otherTab = stateGroup[0].activeTab;
                        }
                        // If we see a user ID that is not in our members list, trigger a reload
                        if (members.length > 0 && !members.find(m => m.id === key)) {
                            hasNewMembers = true;
                        }
                    }
                }

                setOtherMemberTab(otherTab);
                setOnlineIds(online);

                if (hasNewMembers) {
                    fetch(`/api/love-space/members?roomId=${roomId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (Array.isArray(data?.members)) {
                                const sorted = data.members.sort((a: LoveRoomMember, b: LoveRoomMember) =>
                                    new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
                                );
                                setMembers(sorted);
                            }
                        })
                        .catch(() => { });
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        activeTab: activeTab,
                        updatedAt: new Date().toISOString(),
                    });
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [currentMember, roomId, supabase]);

    // Track activeTab changes
    useEffect(() => {
        if (activeTab === 'chat' || showGameChat) {
            setUnreadCount(0);
        }

        if (channelRef.current && currentMember) {
            channelRef.current.track({
                activeTab: activeTab,
                updatedAt: new Date().toISOString(),
            }).catch(console.error);
        }
    }, [activeTab, currentMember, showGameChat]);

    const copyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Fetch members to know other member name
    useEffect(() => {
        if (!roomId) return;
        const loadMembers = async () => {
            try {
                const res = await fetch(`/api/love-space/members?roomId=${roomId}`);
                const data = await res.json();
                if (Array.isArray(data?.members)) {
                    const sorted = data.members.sort((a: LoveRoomMember, b: LoveRoomMember) =>
                        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
                    );
                    setMembers(sorted);
                }
            } catch {
                // ignore
            }
        };
        loadMembers();
    }, [roomId]);

    const otherMember = currentMember && members.length > 0
        ? members.find(m => m.id !== currentMember.id) || null
        : null;
    const isOtherOnline = !!(otherMember && onlineIds.has(otherMember.id));

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
            <header className="hidden sm:flex px-4 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-pink-100 dark:border-pink-900/50 items-center justify-between z-20 sticky top-0">
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
            <div className="flex-1 overflow-hidden flex flex-col z-10 w-full pt-3 sm:pt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full w-full">
                    <TabsList className="grid grid-cols-4 w-[calc(100%-2rem)] bg-white/80 dark:bg-slate-900/80 p-1.5 mx-auto my-2 rounded-2xl sm:rounded-xl backdrop-blur-md h-14 border border-pink-200 dark:border-pink-900/50 shadow-[0_8px_30px_rgb(236,72,153,0.12)] overflow-x-auto hide-scrollbar flex-shrink-0 relative">
                        {/* Mobile Invite Button (Absolute positioned inside the tabs area or just below it if preferred) */}

                        <TabsTrigger value="home" className="relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-2 transition-all">
                            Home
                            {otherMemberTab === 'home' && <div className="absolute top-1 right-2 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />}
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md border border-white dark:border-slate-900">
                                    {unreadCount}
                                </div>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="xox" className="relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-2 transition-all">
                            XOX
                            {otherMemberTab === 'xox' && <div className="absolute top-1 right-2 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />}
                        </TabsTrigger>
                        <TabsTrigger value="ludo" className="relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-2 transition-all">
                            Ludo
                            {otherMemberTab === 'ludo' && <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />}
                        </TabsTrigger>
                        <TabsTrigger value="snake" className="relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-2 transition-all">
                            Snake
                            {otherMemberTab === 'snake' && <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />}
                        </TabsTrigger>
                    </TabsList>
                    {/* Presence status chip */}
                    <div className="px-4 -mt-1 mb-1 flex items-center justify-between">
                        {otherMember && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/60 border border-pink-100 dark:border-pink-900/40 text-[11px] text-gray-600 dark:text-gray-300 shadow-sm">
                                <span className={`w-2 h-2 rounded-full ${isOtherOnline ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.9)]' : 'bg-gray-400'}`} />
                                <span className="font-semibold">{otherMember.nickname}</span>
                                <span className={isOtherOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{isOtherOnline ? 'Online' : 'Offline'}</span>
                            </div>
                        )}
                        {/* Network Quality Indicator */}
                        <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 px-2 py-0.5 rounded-full border border-pink-50 dark:border-pink-900/20" title={`Network: ${networkQuality}`}>
                            <div className={`w-1 h-1.5 rounded-sm ${networkQuality === 'poor' ? 'bg-red-500' : (networkQuality === 'fair' ? 'bg-yellow-500' : 'bg-green-500')}`} />
                            <div className={`w-1 h-2.5 rounded-sm ${networkQuality === 'poor' ? 'bg-red-300 dark:bg-red-900/50' : (networkQuality === 'fair' ? 'bg-yellow-500' : 'bg-green-500')}`} />
                            <div className={`w-1 h-3.5 rounded-sm ${networkQuality === 'poor' ? 'bg-red-300 dark:bg-red-900/50' : (networkQuality === 'fair' ? 'bg-yellow-300 dark:bg-yellow-900/50' : 'bg-green-500')}`} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        <TabsContent value="home" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden px-4 pb-4 hide-scrollbar">
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto pt-2">
                                {/* Room Title Card */}
                                <div className="bg-gradient-to-br from-pink-100 to-rose-50 dark:from-pink-900/40 dark:to-rose-900/20 p-6 rounded-[2rem] border border-pink-200 dark:border-pink-800 shadow-sm relative overflow-hidden">
                                    <Heart className="absolute -right-4 -top-4 w-32 h-32 text-pink-500/10 rotate-12" strokeWidth={1} />
                                    <h2 className="text-xs uppercase tracking-widest text-pink-500 dark:text-pink-400 font-bold mb-1">Welcome to</h2>
                                    <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-pink-100 tracking-tight leading-none mb-2 break-words">Love Space</h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 relative z-10 w-4/5 pt-1">Your private couple space. Choose an activity below to get started!</p>
                                </div>

                                {/* Love Quiz Section */}
                                <div className="mt-2 mb-1">
                                    <LoveQuiz roomId={roomId} currentMember={currentMember} members={members} />
                                </div>

                                {/* Quick Links Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className="col-span-2 flex items-center p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-pink-100 dark:border-pink-900/50 hover:scale-[1.02] active:scale-95 transition-all text-left group"
                                    >
                                        <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-pink-500 group-hover:text-white transition-colors text-pink-500 shadow-inner">
                                            <MessageSquareHeart className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Sweet Messages</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Chat with your partner</p>
                                        </div>
                                        {unreadCount > 0 ? (
                                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-md border border-white dark:border-slate-800">
                                                {unreadCount} New
                                            </div>
                                        ) : (
                                            <div className="text-pink-300 dark:text-pink-700 opacity-50"><MessageCircle className="w-5 h-5" /></div>
                                        )}
                                    </button>

                                    <button onClick={() => setActiveTab('xox')} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-purple-100 dark:border-purple-900/50 hover:scale-[1.05] active:scale-95 transition-all group">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-500 shadow-inner">
                                            <Grid3X3 className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Tic Tac Toe</h3>
                                    </button>

                                    <button onClick={() => setActiveTab('ludo')} className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-900/50 hover:scale-[1.05] active:scale-95 transition-all group">
                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500 shadow-inner">
                                            <Dices className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Ludo</h3>
                                    </button>

                                    <button onClick={() => setActiveTab('snake')} className="col-span-2 flex items-center p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-orange-100 dark:border-orange-900/50 hover:scale-[1.02] active:scale-95 transition-all text-left group">
                                        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-500 shadow-inner">
                                            <Flag className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Snake & Ladder</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Custom board adventure</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="chat" className="flex-1 h-full mt-0 data-[state=inactive]:hidden px-0 sm:px-4 pb-0 sm:pb-4 flex flex-col">
                            <div className="flex-1 h-full bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl shadow-inner border-t sm:border border-pink-100 dark:border-pink-900/50 flex flex-col overflow-hidden relative">
                                <div className="absolute top-2 left-2 z-10 w-full sm:hidden p-2 pointer-events-none">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur pointer-events-auto border-pink-200 text-pink-600 shadow-sm"
                                        onClick={() => setActiveTab('home')}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Chat
                                    roomId={roomId}
                                    currentMember={currentMember}
                                    onNewMessage={() => {
                                        if (activeTab !== 'chat' && !showGameChat) {
                                            setUnreadCount(prev => prev + 1);
                                        }
                                    }}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="xox" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-purple-100 dark:border-purple-900/50 overflow-hidden flex items-center justify-center relative">
                                <button
                                    type="button"
                                    onClick={() => setShowGameChat(true)}
                                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center shadow-md border border-white/60"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-4 rounded-full flex items-center justify-center px-1 shadow-md border border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <XOX roomId={roomId} currentMember={currentMember} />
                            </div>
                        </TabsContent>
                        <TabsContent value="ludo" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-emerald-100 dark:border-emerald-900/50 overflow-y-auto p-3 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowGameChat(true)}
                                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border border-white/60"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-4 rounded-full flex items-center justify-center px-1 shadow-md border border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <Ludo roomId={roomId} currentMember={currentMember} members={members} />
                            </div>
                        </TabsContent>
                        <TabsContent value="snake" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-orange-100 dark:border-orange-900/50 overflow-y-auto p-3 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowGameChat(true)}
                                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md border border-white/60"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-4 rounded-full flex items-center justify-center px-1 shadow-md border border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <SnakeLadder roomId={roomId} currentMember={currentMember} members={members} otherOnline={isOtherOnline} />
                            </div>
                        </TabsContent>
                        {showGameChat && (
                            <div className="absolute inset-0 z-30 flex flex-col bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-pink-100 dark:border-pink-900/40 bg-white/90 dark:bg-slate-900/90">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full border-pink-200 text-pink-600 dark:border-pink-800 dark:text-pink-300 bg-white dark:bg-slate-900"
                                            onClick={() => setShowGameChat(false)}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Back to game
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <MessageCircle className="w-4 h-4 text-pink-500" />
                                        <span>Chat</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col overflow-hidden px-2 pb-2 pt-1">
                                    <Chat
                                        roomId={roomId}
                                        currentMember={currentMember}
                                        onNewMessage={() => {
                                            if (!showGameChat && activeTab !== 'chat') {
                                                setUnreadCount(prev => prev + 1);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
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
