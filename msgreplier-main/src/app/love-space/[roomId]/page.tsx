"use client";

export const runtime = 'edge';

import { useEffect, useState, use, useRef, useCallback, useMemo } from 'react';
import { LoveRoom, LoveRoomMember } from '@/types/love-space';
import { JoinRoom } from '../components/join-room';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Chat, XOX, Ludo, SnakeLadder, LoveQuiz, NetworkStatus } from '../components/games';
import { LoveSpaceFlames } from '../components/LoveSpaceFlames';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Signal, SignalLow, SignalZero, Heart, Loader2, MessageSquareHeart, Copy, CheckCircle2, Home, Gamepad2, Dices, Grid3X3, Flag, ArrowLeft, MessageCircle, LogOut, Trophy, Send, Sparkles, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useWebRTC } from '@/hooks/useWebRTC';
import { GameConnection } from '../components/GameConnection';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LoveMessage } from '@/types/love-space';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DynamicRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // Use React.use() to unwrap the params promise (Next.js 15+ compatible way)
    const resolvedParams = use(params);
    const { roomId } = resolvedParams;

    const handleLeaveRoom = async () => {
        if (!currentMember || !roomId) return;
        try {
            // Remove from local storage
            localStorage.removeItem(`loveRoom_${roomId}`);

            // Clean up Supabase presence immediately
            if (channelRef.current) {
                try {
                    await channelRef.current.untrack();
                    await channelRef.current.unsubscribe();
                } catch (e) {
                    console.error("Error cleaning up channel", e);
                }
            }

            // Setting currentMember to null instantly unmounts the room UI (and its intervals)
            setCurrentMember(null);
            toast.success("Left the room");

            // Redirect cleanly
            setTimeout(() => {
                window.location.href = '/love-space';
            }, 100);
        } catch (error) {
            console.error("Error leaving room:", error);
            window.location.href = '/love-space';
        }
    };

    const [room, setRoom] = useState<LoveRoom | null>(null);
    const [currentMember, setCurrentMember] = useState<LoveRoomMember | null>(() => {
        if (typeof window === 'undefined' || !roomId) return null;
        try {
            const saved = localStorage.getItem(`loveRoom_${roomId}`);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Presence & Notification State
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'home';
        return localStorage.getItem(`activeTab_${roomId}`) || 'home';
    });
    const [otherMemberTab, setOtherMemberTab] = useState<string | null>(null);
    const [wakingUpTab, setWakingUpTab] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isRoomClosed, setIsRoomClosed] = useState(false);

    // Persist activeTab
    useEffect(() => {
        if (roomId) {
            localStorage.setItem(`activeTab_${roomId}`, activeTab);
        }
    }, [activeTab, roomId]);
    const [showGameChat, setShowGameChat] = useState(false);
    const [members, setMembers] = useState<LoveRoomMember[]>([]);
    const membersRef = useRef<LoveRoomMember[]>([]);
    useEffect(() => {
        membersRef.current = members;
    }, [members]);
    const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
    const [hasPresenceSynced, setHasPresenceSynced] = useState(false);
    const [isInitialSyncing, setIsInitialSyncing] = useState(true);

    // Give presence a 2s grace period to populate correctly on first join
    useEffect(() => {
        if (hasPresenceSynced) {
            const timer = setTimeout(() => setIsInitialSyncing(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [hasPresenceSynced]);

    const isCreator = members.length > 0 && currentMember?.id === members[0].id;
    
    // Drive creator status synchronously from localStorage so useWebRTC gets the right
    // role on first render — BEFORE the async members API response comes back.
    // The creator's localStorage entry has { ...member, isCreator: true } set at room creation.
    const isCreatorFromStorage = (() => {
        if (typeof window === 'undefined' || !roomId) return false;
        try {
            const saved = localStorage.getItem(`loveRoom_${roomId}`);
            if (!saved) return false;
            return JSON.parse(saved)?.isCreator === true;
        } catch { return false; }
    })();

    // Drive host status from the current members list. 
    // The first person in the room (sorted by join time) is the Host.
    const isHost = members.length > 0 ? members[0].id === currentMember?.id : isCreatorFromStorage;

    // Tab Identity & Leadership
    const [tabInfo] = useState(() => ({
        id: crypto.randomUUID(),
        startTime: Date.now()
    }));
    const [isLeader, setIsLeader] = useState(true);
    const activeTabsRef = useRef<Map<string, { startTime: number, lastSeen: number }>>(new Map());

    const connectionStateRef = useRef<string>('Connecting...');

    const { connectionState, latencyMs, sendMessage, registerHandler, unregisterHandler, reconnect, teardown } = useWebRTC(
        roomId || '',
        currentMember?.id || '',
        isHost,
        isLeader
    );

    useEffect(() => {
        connectionStateRef.current = connectionState;
    }, [connectionState]);

    // Section: Multi-Tab Coordination (Leader Election)
    useEffect(() => {
        if (!roomId || !currentMember) return;
        
        const bc = new BroadcastChannel(`love-room-tabs-${roomId}`);
        
        const electLeader = () => {
            const now = Date.now();
            let leaderId = tabInfo.id;
            let minTime = tabInfo.startTime;

            // Cleanup stale tabs (+5s)
            activeTabsRef.current.forEach((info, id) => {
                if (now - info.lastSeen > 5000) {
                    activeTabsRef.current.delete(id);
                    return;
                }
                if (info.startTime < minTime || (info.startTime === minTime && id < leaderId)) {
                    minTime = info.startTime;
                    leaderId = id;
                }
            });

            const newLeaderStatus = leaderId === tabInfo.id;
            
            if (newLeaderStatus && !isLeader) {
                // 🧨 1% Fix: CLAIM Phase (200ms delay to prevent simultaneous claims)
                console.log(`[RTC] Tab is a candidate for leadership. Confirming...`);
                setTimeout(() => {
                    // Check again after delay
                    let stillWinner = true;
                    activeTabsRef.current.forEach((info, id) => {
                        if (info.startTime < tabInfo.startTime || (info.startTime === tabInfo.startTime && id < tabInfo.id)) {
                            stillWinner = false;
                        }
                    });

                    if (stillWinner) {
                        console.log(`[RTC] Tab leadership confirmed: LEADER`);
                        setIsLeader(true);
                        bc.postMessage({ type: 'tab_claim', tabId: tabInfo.id, startTime: tabInfo.startTime });
                    }
                }, 200);
            } else if (!newLeaderStatus && isLeader) {
                console.log(`[RTC] Tab leadership relinquished: PASSIVE`);
                setIsLeader(false);
            }
        };

        const handleTabClosing = (closingTabId: string) => {
             console.log(`[RTC] Tab ${closingTabId} is closing. Electing new leader...`);
             activeTabsRef.current.delete(closingTabId);
             electLeader();
        };

        const sendHeartbeat = () => {
            bc.postMessage({ 
                type: 'tab_heartbeat', 
                tabId: tabInfo.id, 
                startTime: tabInfo.startTime,
                memberId: currentMember.id 
            });
            electLeader();
        };

        const heartbeatInterval = setInterval(sendHeartbeat, 2000);

        bc.onmessage = (event) => {
            if (event.data.type === 'tab_heartbeat') {
                activeTabsRef.current.set(event.data.tabId, { 
                    startTime: event.data.startTime, 
                    lastSeen: Date.now() 
                });
            } else if (event.data.type === 'tab_closing') {
                handleTabClosing(event.data.tabId);
            } else if (event.data.type === 'tab_claim') {
                // Another tab claimed leader, update our local view
                activeTabsRef.current.set(event.data.tabId, { 
                    startTime: event.data.startTime || 0, // In case claim doesn't have it
                    lastSeen: Date.now() 
                });
                electLeader();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isLeader && connectionStateRef.current === 'Opponent disconnected') {
                console.log("[RTC] Leader tab became visible & disconnected. Attempting recovery...");
                reconnect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', reconnect);

        // Initial election
        sendHeartbeat();

        return () => {
            clearInterval(heartbeatInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', reconnect);
            bc.close();
        };
    }, [roomId, currentMember, reconnect, tabInfo, isLeader]);

    // Section 4: Cleanup (Prevent Ghost Users)
    useEffect(() => {
        const handleBeforeUnload = () => {
             console.log("[RTC] Page unloading. Cleaning up...");
             teardown();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [teardown]);

    // Global "Wake Up" & Sync Handlers
    useEffect(() => {
        if (!registerHandler || !unregisterHandler) return;

        const handleSyncRequest = (payload: any) => {
            if (!payload || payload.senderId === currentMember?.id) return;
            
            // Host Authority: Only host responds to sync_request
            const isHost = membersRef.current.length > 0 && membersRef.current[0].id === currentMember?.id;
            
            if (payload.reason === 'wake_up') {
                const game = payload.game;
                setWakingUpTab(game);
                setTimeout(() => setWakingUpTab(null), 5000);

                const gameNameMap: Record<string, string> = {
                    'xox': 'Tic Tac Toe',
                    'ludo': 'Ludo',
                    'snake': 'Snake & Ladder'
                };
                const gameDisplayName = gameNameMap[payload.game] || payload.game || 'the game';
                
                toast(`Hey! ${payload.senderNickname || 'Your partner'} is waiting for your move in ${gameDisplayName}! 🔔`, {
                    icon: <Bell className="w-4 h-4 text-orange-500" />,
                    duration: 5000,
                    position: 'top-center',
                });
            } else if (payload.reason === 'init' || payload.reason === 'peer_reconnected' || payload.reason === 'channel_open_recovery') {
                if (isHost) {
                    console.log(`[RTC] Responding to global sync request as HOST (reason: ${payload.reason})`);
                    // Note: Game-specific components handle their own state sync via their handlers
                }
            }
        };

        const handleRoomClosed = (payload: any) => {
            console.log(`[RTC] Room closed: ${payload.reason}`);
            setIsRoomClosed(true);
        };

        registerHandler('sync_request', handleSyncRequest);
        registerHandler('room_closed', handleRoomClosed);
        
        return () => {
            unregisterHandler('sync_request', handleSyncRequest);
            unregisterHandler('room_closed', handleRoomClosed);
        };
    }, [registerHandler, unregisterHandler, currentMember?.id, sendMessage]);




    useEffect(() => {
        membersRef.current = members;
    }, [members]);
    const [networkQuality, setNetworkQuality] = useState<'good' | 'fair' | 'poor'>('good');

    // Helper component for tab presence dots
    const TabPresence = ({ tabValue }: { tabValue: string }) => {
        const isPartnerOnTab = isOtherOnline && otherMemberTab === tabValue;
        const isWakingUp = wakingUpTab === tabValue;

        if (!isPartnerOnTab && !isWakingUp) return null;

        return (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                <div className={`relative group/partner ${isWakingUp ? 'animate-bounce scale-125' : ''}`}>
                    <div className={`w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] ${isPartnerOnTab ? '' : 'opacity-40'}`} />
                    {isPartnerOnTab && (
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] rounded opacity-0 group-hover/partner:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {otherMember?.nickname || 'Partner'} is here
                    </div>
                </div>
            </div>
        );
    };

    const channelRef = useRef<RealtimeChannel | null>(null);
    const presenceCleanupRef = useRef(false);
    // Prevents parallel /members fetches during rapid reconnect bursts
    const fetchingMembersRef = useRef(false);
    const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
                const response = await fetch(`/api/love-space/get-room?roomId=${roomId}`, { cache: 'no-store' });
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
                    // Development fix to prevent identical testing locks across tabs
                    if (process.env.NODE_ENV === 'development' && window.location.search.includes('test=true')) {
                        parsed.id = crypto.randomUUID();
                        parsed.nickname = `${parsed.nickname} (Test)`;
                    }
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
        if (!currentMember || !roomId || !hasSupabaseConfig) {
            return;
        }

        let isMounted = true;
        const channelName = `room_presence:${roomId}`;
        let subscribeTimeout: any = null;

        const cleanupChannel = async () => {
            if (presenceCleanupRef.current) return;
            presenceCleanupRef.current = true;
            const current = channelRef.current;
            channelRef.current = null;
            if (subscribeTimeout) {
                clearTimeout(subscribeTimeout);
                subscribeTimeout = null;
            }
            if (current) {
                try {
                    await current.untrack();
                } catch { }
                try {
                    await current.unsubscribe();
                } catch { }
                try {
                    supabase.removeChannel(current);
                } catch { }
            }
            presenceCleanupRef.current = false;
        };

        if (channelRef.current) {
            cleanupChannel();
        }

        let channel: RealtimeChannel | null = null;
        try {
            channel = supabase.channel(channelName, {
                config: {
                    presence: {
                        key: String(currentMember.id),
                    },
                },
            });
        } catch (e) {
            console.error('[Presence] Failed to create channel:', e);
            return;
        }
        if (!channel) return;

        channel
            .on('presence', { event: 'sync' }, () => {
                if (!isMounted) return;
                const presenceState = channel.presenceState();
                console.log('[Presence] Sync event. Keys:', Object.keys(presenceState));

                let otherTab = null;
                const online = new Set<string>();
                let hasNewMembers = false;

                for (const key in presenceState) {
                    const stateGroup = presenceState[key] as any[];
                    if (stateGroup && stateGroup.length > 0) {
                        const normalizedKey = String(key);
                        online.add(normalizedKey);
                        if (normalizedKey !== String(currentMember.id)) {
                            otherTab = stateGroup[0].activeTab;
                        }

                        // If we see a user ID that is not in our members list, trigger a reload
                        if (!membersRef.current.find(m => String(m.id) === normalizedKey)) {
                            hasNewMembers = true;
                        }
                    }
                }

                setOtherMemberTab(otherTab);
                setOnlineIds(online);
                setHasPresenceSynced(true);

                if (hasNewMembers && !fetchingMembersRef.current) {
                    console.log('[Presence] Unknown member detected, refetching...');
                    loadMembers();
                }
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                if (!isMounted) return;
                const normalizedKey = String(key);
                console.log('[Presence] Join event:', normalizedKey);
                
                setOnlineIds(prev => {
                    const next = new Set(prev);
                    next.add(normalizedKey);
                    return next;
                });

                if (normalizedKey !== String(currentMember.id) && !membersRef.current.find(m => String(m.id) === normalizedKey) && !fetchingMembersRef.current) {
                    loadMembers();
                }

                if (normalizedKey !== String(currentMember.id) && newPresences && newPresences.length > 0) {
                    setOtherMemberTab(newPresences[0].activeTab);
                }

                if (normalizedKey !== String(currentMember.id) && membersRef.current.find(m => String(m.id) === normalizedKey) && connectionStateRef.current === 'Opponent disconnected') {
                    reconnect();
                }
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                if (!isMounted) return;
                const normalizedKey = String(key);
                console.log('[Presence] Leave event:', normalizedKey);
                
                setOnlineIds(prev => {
                    const next = new Set(prev);
                    next.delete(normalizedKey);
                    return next;
                });
            })
            .subscribe(async (status) => {
                if (!isMounted) return;
                console.log('[Presence] Status:', status);
                if (status === 'SUBSCRIBED') {
                    if (subscribeTimeout) {
                        clearTimeout(subscribeTimeout);
                        subscribeTimeout = null;
                    }
                    try {
                        await channel.track({
                            activeTab: activeTab,
                            updatedAt: new Date().toISOString(),
                        });
                    } catch (error) {
                        console.error('Error tracking self:', error);
                    }
                }
            });

        subscribeTimeout = setTimeout(() => {
            if (!isMounted) return;
            console.warn('[Presence] Subscription timeout');
        }, 6000);

        channelRef.current = channel;

        return () => {
            isMounted = false;
            cleanupChannel();
        };
    }, [currentMember?.id, roomId]);

    // Track activeTab changes
    useEffect(() => {
        if (activeTab === 'chat' || showGameChat) {
            setUnreadCount(0);
        }

        if (channelRef.current && currentMember && hasSupabaseConfig) {
            channelRef.current.track({
                activeTab: activeTab,
                updatedAt: new Date().toISOString(),
            }).catch(console.error);
        }
    }, [activeTab, currentMember, showGameChat, hasSupabaseConfig]);

    const copyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const copyCode = () => {
        if (!room?.room_code) return;
        navigator.clipboard.writeText(room.room_code);
        setCopiedCode(true);
        toast.success("Room code copied!");
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const copyInviteLink = () => {
        if (!room?.room_code) return;
        const url = `${window.location.origin}/love-space/join?code=${room.room_code}`;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        toast.success("Invite link copied!");
        setTimeout(() => setCopiedLink(false), 2000);
    };

    // Move loadMembers to a stable useCallback so it can be triggered manually
    const loadMembers = useCallback(async () => {
        if (!roomId) return;
        try {
            const res = await fetch(`/api/love-space/members?roomId=${roomId}`, { cache: 'no-store' });
            const data = await res.json();
            if (Array.isArray(data?.members)) {
                const sorted = data.members.sort((a: LoveRoomMember, b: LoveRoomMember) => {
                    const timeA = new Date(a.joined_at).getTime();
                    const timeB = new Date(b.joined_at).getTime();
                    if (timeA !== timeB) return timeA - timeB;
                    return a.id.localeCompare(b.id);
                });
                setMembers(sorted);
            }
        } catch {
            // ignore
        }
    }, [roomId]);

    // Initial load
    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    // Subscribe to member changes via Supabase Realtime instead of polling
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase
            .channel(`public:love_room_members:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT = new member joins, DELETE = member leaves
                    schema: 'public',
                    table: 'love_room_members',
                    filter: `room_id=eq.${roomId}`,
                },
                async () => {
                    // Refetch members once on any change
                    loadMembers();                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // CRITICAL: Do NOT add `supabase` here — it's a stable module singleton.
        // Adding it would cause this channel to be torn down and rebuilt on every render.
    }, [roomId]);

    // Live Frontend Expiration Sweeper
    // If the room is older than 10 minutes AND the other member is offline, terminate.
    const otherMember = currentMember && members.length > 0
        ? members.find(m => String(m.id) !== String(currentMember.id)) || null
        : null;
    
    // Stable presence check: 
    // - Default to TRUE (Connected) if we haven't synced yet OR if we are in the initial grace period.
    // - Trust onlineIds only after the 2s grace period ends.
    // - Also consider WebRTC connection status as a source of truth.
    const isOtherOnline = useMemo(() => {
        // Source 1: WebRTC Data Channel (Most accurate for game interactions)
        if (connectionState === 'Connected') return true;

        // Grace period / Loading state
        if (!hasPresenceSynced || isInitialSyncing || members.length < 2) return true;
        
        // Source 2: Supabase Presence
        if (!otherMember) return false;
        const isOnlineViaPresence = onlineIds.has(String(otherMember.id));

        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Status] Partner ${otherMember.nickname}: WebRTC=${connectionState}, Presence=${isOnlineViaPresence ? 'Online' : 'Offline'}`);
        }

        return isOnlineViaPresence;
    }, [connectionState, hasPresenceSynced, isInitialSyncing, members.length, otherMember, onlineIds]);

    useEffect(() => {
        if (!room || !currentMember || !hasSupabaseConfig) return;

        let inactivityTimeout: NodeJS.Timeout;
        let heartbeatInterval: NodeJS.Timeout;

        // --- HEARTBEAT LOGIC ---
        // We ping the server every 1 minute to push the expires_at time, BUT ONLY IF:
        // 1. We are waiting for a partner (members.length < 2)
        // 2. Both players are online (isOtherOnline is true)
        const shouldPing = membersRef.current.length < 2 || isOtherOnline;
        
        const sendHeartbeat = () => {
             fetch('/api/love-space/heartbeat', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ roomId: room.id })
             }).catch(() => {});
        };

        if (shouldPing) {
             // Send an immediate heartbeat to ensure we are marked active right now,
             // unless we just created it (but sending again doesn't hurt).
             sendHeartbeat();
             // Then send every 1 minute
             heartbeatInterval = setInterval(sendHeartbeat, 60 * 1000);
        }

        // --- FRONTEND EXPIRATION LOGIC ---
        // If the other player is currently offline (via presence) OR the WebRTC connection is lost (and we have 2 members), 
        // start a 10 min countdown. If they come back or reconnect, this effect re-runs, clearing the timeout.
        const isPeerOffline = !isOtherOnline || connectionState === 'Opponent disconnected';

        if (membersRef.current.length >= 2 && isPeerOffline) {
             console.log(`[Expiration] Peer offline or connection lost. Starting 10m timeout. Connection: ${connectionState}, Presence: ${isOtherOnline}`);
             inactivityTimeout = setTimeout(() => {
                  setError("This room has expired because a player was inactive or offline for 10 minutes.");
                  fetch('/api/love-space/update-room-status', { 
                      method: 'POST', 
                      body: JSON.stringify({ roomId: room.id, isActive: false }) 
                  }).catch(() => {});
             }, 10 * 60 * 1000); // 10 minutes
        }

        // If no one joined for 10 minutes, also terminate.
        if (membersRef.current.length < 2) {
             const roomCreatedTime = new Date(room.created_at).getTime();
             const timeRemaining = (roomCreatedTime + 10 * 60 * 1000) - Date.now();
             
             const expireAsEmpty = () => {
                  // Verify with API to prevent race conditions
                  fetch(`/api/love-space/members?roomId=${room.id}`)
                      .then(res => res.json())
                      .then(data => {
                          const actualCount = Array.isArray(data?.members) ? data.members.length : membersRef.current.length;
                          if (actualCount < 2) {
                              setError("This room has expired because no one joined within 10 minutes.");
                              fetch('/api/love-space/update-room-status', { 
                                  method: 'POST', 
                                  body: JSON.stringify({ roomId: room.id, isActive: false }) 
                              }).catch(() => {});
                          }
                      }).catch(() => {});
             };

             if (timeRemaining <= 0) {
                 expireAsEmpty();
             } else {
                 inactivityTimeout = setTimeout(expireAsEmpty, timeRemaining);
             }
        }

        return () => {
            if (inactivityTimeout) clearTimeout(inactivityTimeout);
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [room, currentMember, isOtherOnline, connectionState]);

    // PART D: Move-based Inactivity Checker
    useEffect(() => {
        if (!room || !roomId || isRoomClosed) return;

        const checkInactivity = async () => {
             try {
                 const res = await fetch(`/api/love-space/get-room?roomId=${roomId}`, { cache: 'no-store' });
                 const data = await res.json();
                 if (data?.room) {
                     const lastActivity = new Date(data.room.last_activity_at || data.room.created_at).getTime();
                     const now = Date.now();
                     const inactiveMs = now - lastActivity;

                     if (inactiveMs >= 10 * 60 * 1000) {
                         console.log(`[Inactivity] 10m limit reached (DB verify). Closing room.`);
                         setIsRoomClosed(true);
                         
                         // 1. Broadcast to peer
                         if (sendMessage) {
                             sendMessage('room_closed', { reason: 'inactivity' }, { reliable: true });
                         }

                         // 2. Update DB
                         fetch('/api/love-space/update-room-status', { 
                             method: 'POST', 
                             body: JSON.stringify({ roomId, isActive: false, status: 'closed' }) 
                         }).catch(() => {});
                     }
                 }
             } catch (e) {
                 console.error('[Inactivity] Check failed:', e);
             }
        };

        const interval = setInterval(checkInactivity, 60 * 1000);
        return () => clearInterval(interval);
    }, [room, roomId, isRoomClosed, sendMessage]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4 text-center">
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
        return <JoinRoom room={room} onJoined={(m) => {
            setCurrentMember(m);
            loadMembers(); // Crucial: explicitly refetch now that they joined!
        }} />;
    }

    return (
        <div className="min-h-[100dvh] h-[100dvh] sm:h-[calc(100vh-2rem)] bg-gradient-to-b from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 flex flex-col overflow-hidden max-w-md mx-auto shadow-lg relative sm:my-4 sm:rounded-3xl sm:border sm:border-pink-200 dark:sm:border-pink-900/50">

            {/* Inactivity Room-Close Overlay */}
            <AnimatePresence>
                {isRoomClosed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogOut className="w-10 h-10 text-pink-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Room Closed</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] mx-auto">
                                This room was closed due to inactivity. You can create a new room anytime.
                            </p>
                            <Button 
                                onClick={() => window.location.href = '/'}
                                className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-8 py-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                <Home className="w-5 h-5 mr-2" /> Go Home
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Area */}
            <header className="hidden sm:flex px-4 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-pink-100 dark:border-pink-900/50 items-center justify-between z-20 sticky top-0">
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                    <h1 className="font-bold text-lg text-gray-800 dark:text-pink-100 tracking-tight">Love Space</h1>
                </div>

                <div className="flex items-center gap-4">
                    <NetworkStatus 
                        connectionStatus={
                            connectionState === 'Connected' ? 'connected' :
                            connectionState === 'Connecting...' ? 'reconnecting' :
                            'disconnected'
                        } 
                    />
                    <GameConnection 
                         connectionState={connectionState} 
                         latencyMs={latencyMs}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyLink}
                        className="text-xs h-8 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-full px-3"
                    >
                        {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied ? "Copied" : "Invite"}
                    </Button>
                </div>
            </header>

            {/* Main Content Area Using Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col z-10 w-full pt-3 sm:pt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full w-full">
                    <TabsList className="flex w-[calc(100%-2rem)] bg-white/80 dark:bg-slate-900/80 p-1 mx-auto my-2 rounded-2xl sm:rounded-xl backdrop-blur-md h-12 border border-pink-200 dark:border-pink-900/50 shadow-[0_8px_30px_rgb(236,72,153,0.12)] flex-shrink-0 relative gap-1">
                        {/* Network Status Indicator */}
                        <div className="absolute -top-12 right-0 z-50 sm:hidden">
                            <NetworkStatus 
                                connectionStatus={
                                    connectionState === 'Connected' ? 'connected' :
                                    connectionState === 'Connecting...' ? 'reconnecting' :
                                    'disconnected'
                                } 
                            />
                        </div>
                        
                        {/* Mobile Invite Button (Absolute positioned inside the tabs area or just below it if preferred) */}

                        <TabsTrigger 
                            value="home" 
                            className="flex-1 relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-3 transition-all focus-visible:ring-0"
                        >
                            Home
                            <TabPresence tabValue="home" />
                        </TabsTrigger>
                        <TabsTrigger 
                            value="xox" 
                            className="flex-1 relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-3 transition-all"
                        >
                            XOX
                            <TabPresence tabValue="xox" />
                        </TabsTrigger>
                        <TabsTrigger 
                            value="ludo" 
                            className="flex-1 relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-3 transition-all"
                        >
                            Ludo
                            <TabPresence tabValue="ludo" />
                        </TabsTrigger>
                        <TabsTrigger 
                            value="snake" 
                            className="flex-1 relative h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-400 data-[state=active]:text-white data-[state=active]:shadow-md text-xs font-medium whitespace-nowrap px-3 transition-all"
                        >
                            Snake
                            <TabPresence tabValue="snake" />
                        </TabsTrigger>
                    </TabsList>
                    {/* Presence status chip / Crazy Title */}
                    <div className="px-4 -mt-1 mb-2 flex flex-col items-center justify-center w-full relative z-10 min-h-[40px]">
                        {otherMember ? (
                            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in duration-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 drop-shadow-sm filter">
                                        {currentMember?.nickname}
                                    </span>
                                    <div className="relative flex items-center justify-center w-8 h-8 mx-1">
                                        <Heart className={`absolute w-7 h-7 text-pink-500 fill-pink-500 transition-all duration-1000 ${isOtherOnline ? 'animate-pulse scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'opacity-60 grayscale-[50%]'}`} />
                                        <Heart className={`absolute w-3 h-3 text-white fill-white ${isOtherOnline ? 'animate-ping' : 'opacity-0'}`} />
                                    </div>
                                    <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-l from-purple-500 to-fuchsia-500 drop-shadow-sm filter">
                                        {otherMember.nickname}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/60 dark:bg-slate-900/40 border border-pink-200/50 dark:border-pink-800/30 text-[9px] uppercase tracking-widest font-bold backdrop-blur-sm -mt-0.5">
                                    <div className="flex items-center gap-1.5 text-pink-600/80 dark:text-pink-300/80">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isOtherOnline ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)] animate-pulse' : 'bg-gray-400'}`} />
                                        {isOtherOnline ? 'Connected' : 'Away'}
                                    </div>
                                    {isOtherOnline && latencyMs > 0 && (
                                        <>
                                            <div className="w-[1px] h-2 bg-pink-200 dark:bg-pink-800/50" />
                                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 lowercase tracking-normal">
                                                <div className="flex gap-[1px] items-end h-2 pb-[1px]">
                                                    <div className={`w-[1.5px] h-[3px] rounded-full ${latencyMs < 300 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    <div className={`w-[1.5px] h-[5px] rounded-full ${latencyMs < 200 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    <div className={`w-[1.5px] h-[7px] rounded-full ${latencyMs < 100 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                </div>
                                                <span>{latencyMs}ms</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in duration-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 drop-shadow-sm filter">
                                        {currentMember?.nickname}
                                    </span>
                                    <div className="relative flex items-center justify-center w-8 h-8 mx-1 opacity-50 grayscale">
                                        <Heart className="absolute w-7 h-7 fill-current" />
                                    </div>
                                    <span className="text-xl sm:text-2xl font-black text-gray-400 dark:text-gray-600 drop-shadow-sm filter blur-[1px]">
                                        Partner
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/60 dark:bg-slate-900/40 border border-pink-200/50 dark:border-pink-800/30 text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold backdrop-blur-sm -mt-0.5 animate-pulse">
                                    Waiting for companion...
                                </div>
                            </div>
                        )}
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

                                {/* Send a Sweet Message Option */}
                                <button 
                                    onClick={() => setShowGameChat(true)}
                                    className="w-full flex items-center justify-between p-5 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-[2rem] shadow-lg shadow-pink-200/50 dark:shadow-pink-900/20 text-white active:scale-[0.98] transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                                    
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner group-hover:bg-white/30 transition-colors relative">
                                            <MessageCircle className="w-6 h-6 text-white" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 bg-white text-pink-500 text-[10px] font-black min-w-[1.25rem] h-5 rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-pink-500 animate-in zoom-in duration-300">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black text-sm uppercase tracking-tight">Send a Sweet Message</span>
                                            <span className="block text-[10px] text-pink-100 opacity-90 font-medium">Open the heart-to-heart chat ❤️</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 relative z-10">
                                        <div className="p-2 bg-white/10 rounded-full">
                                            <Sparkles className="w-4 h-4 text-white/70 group-hover:rotate-12 transition-transform" />
                                        </div>
                                    </div>
                                </button>


                                {/* Quick Links Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-1">
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

                                {/* Love Score (Quiz) Section */}
                                <div className="mt-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-pink-100 dark:border-pink-900/50 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                                    <div className="px-6 py-4 border-b border-pink-50 dark:border-pink-900/20 flex items-center justify-between bg-pink-50/30 dark:bg-pink-900/10">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-pink-500" />
                                            <h3 className="font-bold text-gray-800 dark:text-pink-100">Love Score Quiz</h3>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-pink-500/70">Interactive</div>
                                    </div>
                                    <div className="flex-1 p-2">
                                        <LoveQuiz 
                                            roomId={roomId} 
                                            currentMember={currentMember!} 
                                            members={members} 
                                            sendMessage={sendMessage}
                                            registerHandler={registerHandler}
                                            unregisterHandler={unregisterHandler}
                                        />
                                    </div>
                                </div>

                                {/* FLAMES Section */}
                                <div className="mt-4">
                                    <LoveSpaceFlames 
                                        sendMessage={sendMessage}
                                        registerHandler={registerHandler}
                                        unregisterHandler={unregisterHandler}
                                        currentMember={currentMember!}
                                        otherMember={otherMember}
                                    />
                                </div>

                                {/* Invite Partner Section */}
                                <div className="mt-8 flex flex-col items-center gap-4">
                                    <div className="w-full max-w-[320px] bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-4 border border-pink-100 dark:border-pink-900/30 shadow-sm flex flex-col gap-3 group transition-all hover:shadow-pink-200/20">
                                        <div className="flex items-center gap-2 px-1">
                                            <Sparkles className="w-3 h-3 text-pink-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400">Invite Partner</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-pink-50/50 dark:bg-slate-950/50 rounded-2xl p-2 pl-4 border border-pink-100 dark:border-pink-900/20 transition-all group-hover:bg-pink-100/30 dark:group-hover:bg-slate-900/40">
                                            <span className="flex-1 text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium">
                                                {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                                            </span>
                                            <Button 
                                                onClick={copyLink}
                                                className="h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-[10px] font-black uppercase px-4 shadow-md transition-all active:scale-95 flex-shrink-0"
                                            >
                                                {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                                                {copied ? "Copied!" : "Copy Link"}
                                            </Button>
                                        </div>
                                        <p className="text-[9px] text-gray-400 dark:text-gray-500 px-1 text-center italic">Share this link with your partner to start your journey! ❤️</p>
                                    </div>
                                </div>

                                {/* Room Code Section (Moved to bottom) */}
                                <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-pink-100 dark:border-pink-900/50 shadow-sm flex flex-col items-center gap-4 text-center">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Room code</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-2">
                                                {room?.room_code?.split('').map((digit, i) => (
                                                    <div key={i} className="w-10 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center border border-pink-100 dark:border-pink-900/50">
                                                        <span className="text-2xl font-black font-mono text-pink-600 dark:text-pink-400">{digit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <Button 
                                            onClick={copyCode}
                                            variant="outline"
                                            className="flex-1 rounded-xl h-12 border-pink-100 dark:border-pink-900/50 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-xs"
                                        >
                                            {copiedCode ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                            {copiedCode ? "Copied" : "Copy code"}
                                        </Button>
                                        <Button 
                                            onClick={copyInviteLink}
                                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl h-12 shadow-md hover:shadow-lg transition-all text-xs"
                                        >
                                            {copiedLink ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                                            {copiedLink ? "Copied" : "Copy invite link"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Network & Latency Stats (Home Tab Footer) */}
                                {isOtherOnline && latencyMs > 0 && (
                                    <div className="flex justify-center items-center gap-2 py-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30">
                                            <div className="flex gap-[1px] items-end h-2.5 pb-[1px]">
                                                <div className={`w-[2px] h-[4px] rounded-full ${latencyMs < 300 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                <div className={`w-[2px] h-[6px] rounded-full ${latencyMs < 200 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                <div className={`w-[2px] h-[8px] rounded-full ${latencyMs < 100 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-600/60 dark:text-pink-400/60">
                                                Ping: <span className={latencyMs < 200 ? 'text-green-500' : 'text-amber-500'}>{latencyMs}ms</span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Leave Room Action */}
                                <div className="mt-6 flex justify-center pb-8 border-t border-pink-100 dark:border-pink-900/30 pt-4">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:hover:bg-red-950/30 rounded-full px-6">
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Leave Love Room
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-3xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Leave Room?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to leave this Love Room? You will appear offline to your partner and will need to join again to chat or play games.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="sm:justify-start gap-2">
                                                <AlertDialogCancel className="rounded-xl flex-1">Stay Here</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleLeaveRoom} className="rounded-xl flex-1 bg-red-500 hover:bg-red-600 text-white">
                                                    Yes, Leave
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                {/* Feedback Section */}
                                <div className="mt-2 flex flex-col items-center gap-1 pb-8">
                                    <a 
                                        href="mailto:care.msgreplier@gmail.com" 
                                        className="text-[9px] text-pink-500/60 dark:text-pink-400/40 hover:text-pink-500 transition-colors font-bold uppercase tracking-widest"
                                    >
                                        Feedback: care.msgreplier@gmail.com
                                    </a>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="chat" forceMount className="flex-1 h-full mt-0 data-[state=inactive]:hidden px-0 sm:px-4 pb-0 sm:pb-4 flex flex-col">
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
                                    members={members}
                                    onNewMessage={() => {
                                        if (activeTab !== 'chat' && !showGameChat) {
                                            setUnreadCount(prev => prev + 1);
                                        }
                                    }}
                                    sendMessage={sendMessage}
                                    registerHandler={registerHandler}
                                    unregisterHandler={unregisterHandler}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="xox" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-purple-100 dark:border-purple-900/50 overflow-hidden flex items-center justify-center relative">
                                <button
                                    type="button"
                                    onClick={() => setShowGameChat(true)}
                                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center shadow-md border border-white/60 z-40"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-4 rounded-full flex items-center justify-center px-1 shadow-md border border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <XOX 
                                    roomId={roomId} 
                                    currentMember={currentMember} 
                                    members={members} 
                                    otherOnline={isOtherOnline}
                                    sendMessage={sendMessage}
                                    registerHandler={registerHandler}
                                    unregisterHandler={unregisterHandler}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="ludo" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-emerald-100 dark:border-emerald-900/50 overflow-y-auto p-3 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowGameChat(true)}
                                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border border-white/60 z-40"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-4 rounded-full flex items-center justify-center px-1 shadow-md border border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <Ludo 
                                    roomId={roomId} 
                                    currentMember={currentMember} 
                                    members={members} 
                                    otherOnline={isOtherOnline}
                                    connectionState={connectionState}
                                    sendMessage={sendMessage}
                                    registerHandler={registerHandler}
                                    unregisterHandler={unregisterHandler}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="snake" className="h-full mt-0 data-[state=inactive]:hidden px-4 pb-4">
                            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-orange-100 dark:border-orange-900/50 overflow-y-auto p-3 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowGameChat(true)}
                                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md border border-white/60 z-40"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-4 rounded-full flex items-center justify-center px-1 shadow-md border border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <SnakeLadder 
                                    roomId={roomId} 
                                    currentMember={currentMember} 
                                    members={members} 
                                    otherOnline={isOtherOnline} 
                                    connectionState={connectionState}
                                    sendMessage={sendMessage}
                                    registerHandler={registerHandler}
                                    unregisterHandler={unregisterHandler}
                                />
                            </div>
                        </TabsContent>
                        {showGameChat && (
                            <div className="absolute inset-0 z-30 flex flex-col bg-white dark:bg-slate-950">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-pink-100 dark:border-pink-900/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-3 rounded-full border-pink-200 text-pink-600 dark:border-pink-800 dark:text-pink-300 bg-white dark:bg-slate-900 shadow-sm hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all active:scale-95"
                                            onClick={() => setShowGameChat(false)}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            <span className="text-xs font-bold">Back to game</span>
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/30">
                                        <MessageCircle className="w-4 h-4 text-pink-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400">Game Chat</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <Chat
                                        roomId={roomId}
                                        currentMember={currentMember}
                                        members={members}
                                        onNewMessage={() => {
                                            if (!showGameChat && activeTab !== 'chat') {
                                                setUnreadCount(prev => prev + 1);
                                            }
                                        }}
                                        sendMessage={sendMessage}
                                        registerHandler={registerHandler}
                                        unregisterHandler={unregisterHandler}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Tabs>
            </div>

        </div>
    );
}
