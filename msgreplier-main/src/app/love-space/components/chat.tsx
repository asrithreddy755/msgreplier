"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { LoveMessage, LoveRoomMember } from '@/types/love-space';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Heart, Loader2 } from 'lucide-react';
import { RealtimeMessageType } from '@/lib/realtime/types';


export function Chat({ 
    roomId, 
    currentMember, 
    members = [],
    onNewMessage,
    sendMessage,
    registerHandler,
    unregisterHandler,
    otherOnline,
    connectionState
}: { 
    roomId: string;
    currentMember: LoveRoomMember;
    members?: LoveRoomMember[];
    onNewMessage?: () => void;
    sendMessage?: (type: RealtimeMessageType, payload?: any, options?: { reliable?: boolean }) => void;
    registerHandler?: (type: RealtimeMessageType, handler: (payload: any) => void) => void;
    unregisterHandler?: (type: RealtimeMessageType, handler?: (payload: any) => void) => void;
    otherOnline?: boolean;
    connectionState?: string;
}) {
    const [messages, setMessages] = useState<LoveMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pendingMessagesRef = useRef<Map<string, { payload: any, attempts: number }>>(new Map());
    const messagesRef = useRef<LoveMessage[]>([]);
    const lastSyncRequestAtRef = useRef(0);
    const chatBackupKey = useMemo(() => `love_space_${roomId}_chat`, [roomId]);
    const unsavedMessagesRef = useRef<LoveMessage[]>([]);
    const lastSavedMessageIdRef = useRef<string | null>(null);
    const hasUnsavedChangesRef = useRef(false);
    const versionRef = useRef(0);
    const isHost = members?.length > 0 && members[0].id === currentMember.id;

    // UX Feature States
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [activeReactions, setActiveReactions] = useState<{ id: string, emoji: string }[]>([]);

    // Use a ref for onNewMessage so the channel effect dep array stays stable
    const onNewMessageRef = useRef(onNewMessage);
    useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    const persistMessagesBackup = useCallback((nextMessages: LoveMessage[]) => {
        try {
            localStorage.setItem(chatBackupKey, JSON.stringify(nextMessages.slice(-500)));
        } catch {
            return;
        }
    }, [chatBackupKey]);

    const mergeMessages = useCallback((incoming: LoveMessage[]) => {
        const dedup = new Map<string, LoveMessage>();
        
        // Track composite keys to catch duplicates with different IDs (e.g. from before the fix)
        // Composite: sender + message + approximate timestamp (within 2 seconds)
        const fallbackMap = new Map<string, string>(); 

        const getFallbackKey = (m: LoveMessage) => {
            const seconds = Math.floor(Date.parse(m.created_at) / 2000);
            return `${m.sender_nickname}|${m.message}|${seconds}`;
        };

        // Current messages
        for (const m of messagesRef.current) {
            dedup.set(m.id, m);
            fallbackMap.set(getFallbackKey(m), m.id);
        }

        // Incoming messages
        for (const m of incoming) {
            const fKey = getFallbackKey(m);
            const existingIdByContent = fallbackMap.get(fKey);

            if (dedup.has(m.id)) {
                // Exact ID match, update if needed (though usually identical)
                dedup.set(m.id, m);
            } else if (existingIdByContent) {
                // Content match but different ID - ignore the duplicate
                continue;
            } else {
                // New message
                dedup.set(m.id, m);
                fallbackMap.set(fKey, m.id);
            }
        }

        const merged = Array.from(dedup.values()).sort(
            (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
        );
        messagesRef.current = merged;
        setMessages(merged);
        persistMessagesBackup(merged);
        
        // Increment version to track state changes for sync logic if needed
        versionRef.current++;
        
        return merged;
    }, [persistMessagesBackup]);

    const requestSync = useCallback((reason: string) => {
        if (!sendMessage) return;
        const now = Date.now();
        if (now - lastSyncRequestAtRef.current < 2000) return;
        lastSyncRequestAtRef.current = now;
        console.log(`[Chat] Requesting sync (reason: ${reason})`);
        sendMessage('chat_sync_request', { roomId, senderId: currentMember.id, reason, sentAt: now });
    }, [sendMessage, roomId, currentMember.id]);

    useEffect(() => {
        let isMounted = true;
        const init = () => {
            try {
                const backupRaw = localStorage.getItem(chatBackupKey);
                if (backupRaw) {
                    const backup = JSON.parse(backupRaw) as LoveMessage[];
                    if (Array.isArray(backup) && backup.length > 0) {
                        mergeMessages(backup);
                    }
                }
            } catch {
                // ignore
            }

            if (isMounted) requestSync('init');
        };
        if (roomId) init();
        return () => {
            isMounted = false;
        };
    }, [roomId, chatBackupKey, mergeMessages, requestSync]);


    // Realtime Broadcast chat integration
    useEffect(() => {
        if (!registerHandler || !unregisterHandler) return;

        const handleIncomingChat = (payload: any) => {
            // Ignore messages sent by the current user to prevent duplication
            if (payload.sender_nickname === currentMember.nickname) {
                return;
            }

            const newMsg: LoveMessage = {
                id: payload.id || crypto.randomUUID(),
                room_id: roomId,
                sender_nickname: payload.sender_nickname,
                message: payload.message,
                created_at: payload.created_at || new Date().toISOString()
            };

            mergeMessages([newMsg]);

            // Send ACK back to sender immediately
            if (sendMessage && payload.id) {
                 sendMessage('ack', { id: payload.id });
            }

            if (onNewMessageRef.current) {
                onNewMessageRef.current();
            }
        };

        const handleAck = (payload: any) => {
            if (payload && payload.id) {
                // Remove from pending queue
                pendingMessagesRef.current.delete(payload.id);
            }
        };

        const handleTyping = (payload: any) => {
             if (payload && typeof payload.value === 'boolean') {
                 setIsPartnerTyping(payload.value);
             }
        };

        const handleReaction = (payload: any) => {
             if (payload && payload.emoji) {
                 const id = crypto.randomUUID();
                 setActiveReactions(prev => [...prev, { id, emoji: payload.emoji }]);
                 // Remove floating emoji after animation
                 setTimeout(() => {
                     setActiveReactions(prev => prev.filter(r => r.id !== id));
                 }, 3000);
             }
        };

        const handleSyncRequest = (payload: any) => {
            if (!payload || payload.senderId === currentMember.id) return;
            
            // Responder: Always send current state regardless of host status
            if (sendMessage) {
                console.log("[Realtime] Responding to chat sync request");
                sendMessage('chat_sync_state', {
                    messages: messagesRef.current.slice(-500),
                    updatedAt: Date.now(),
                });
            }
        };

        const handleSyncState = (payload: any) => {
            if (!payload || !Array.isArray(payload.messages)) return;
            console.log(`[Chat] sync received, count: ${payload.messages.length}`);
            mergeMessages(payload.messages);
        };

        registerHandler('chat', handleIncomingChat);
        registerHandler('ack', handleAck);
        registerHandler('typing', handleTyping);
        registerHandler('reaction', handleReaction);
        registerHandler('chat_sync_request', handleSyncRequest);
        registerHandler('chat_sync_state', handleSyncState);

        return () => {
             unregisterHandler('chat', handleIncomingChat);
             unregisterHandler('ack', handleAck);
             unregisterHandler('typing', handleTyping);
             unregisterHandler('reaction', handleReaction);
             unregisterHandler('chat_sync_request', handleSyncRequest);
             unregisterHandler('chat_sync_state', handleSyncState);
        };
    }, [registerHandler, unregisterHandler, roomId, sendMessage, mergeMessages, currentMember.id]);

    // Realtime Broadcast chat integration
    useEffect(() => {
        if (sendMessage && !messages.length) {
            requestSync('empty_messages');
        }
    }, [sendMessage, messages.length, requestSync]);

    // Retry loop for unacknowledged messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (!sendMessage) return;
            pendingMessagesRef.current.forEach((data, id) => {
                if (data.attempts >= 10) {
                    console.error("Max retries reached for message:", id);
                    pendingMessagesRef.current.delete(id);
                    return;
                }
                data.attempts++;
                sendMessage('chat', data.payload);
            });
        }, 4000); // 4 seconds retry interval

        return () => clearInterval(interval);
    }, [sendMessage]);


    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- DB PERSISTENCE LOGIC ---
    const saveToDb = async (isImmediate = false) => {
        if (!hasUnsavedChangesRef.current && !isImmediate) return;
        if (unsavedMessagesRef.current.length === 0) return;

        const messagesToSave = [...unsavedMessagesRef.current];
        console.log(`[SYNC] ${isImmediate ? 'Immediate' : 'Lazy'} sync triggered for Chat (${messagesToSave.length} msgs)`);
        setSyncStatus('syncing');

        try {
            // Save all pending messages
            for (const msg of messagesToSave) {
                await fetch('/api/love-space/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: msg.id,
                        roomId,
                        senderNickname: msg.sender_nickname,
                        message: msg.message,
                        createdAt: msg.created_at,
                    }),
                });
                lastSavedMessageIdRef.current = msg.id;
            }
            
            // Clear successfully saved messages from the ref
            unsavedMessagesRef.current = unsavedMessagesRef.current.filter(
                m => !messagesToSave.find(saved => saved.id === m.id)
            );
            
            console.log(`[SYNC] Chat state saved`);
            hasUnsavedChangesRef.current = false;
            setSyncStatus('saved');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (error) {
            console.error('[SYNC] Failed to persist messages', error);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 3000);
        }
    };

    // Immediate flush logic
    const flushNow = useCallback(() => {
        if (hasUnsavedChangesRef.current) {
            console.log("[SYNC] Immediate flush triggered (Exit/Offline)");
            saveToDb(true);
        }
    }, [roomId]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") flushNow();
        };
        window.addEventListener("beforeunload", flushNow);
        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("offline", flushNow);
        return () => {
            window.removeEventListener("beforeunload", flushNow);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("offline", handleVisibilityChange);
            window.removeEventListener("offline", flushNow);
        };
    }, [flushNow]);

    // Throttled DB Sync Loop (Every 15 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            saveToDb();
        }, 15000);
        return () => clearInterval(interval);
    }, [roomId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!sendMessage) return;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        sendMessage('typing', { value: true });
        
        typingTimeoutRef.current = setTimeout(() => {
            sendMessage('typing', { value: false });
        }, 3000);
    };

    const handleSendReaction = (emoji: string) => {
        if (!sendMessage) return;
        sendMessage('reaction', { emoji });
        const id = crypto.randomUUID();
        setActiveReactions(prev => [...prev, { id, emoji }]);
        setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        setIsLoading(true);
        const uniqueId = crypto.randomUUID();
        const msgData: LoveMessage = {
            id: uniqueId,
            room_id: roomId,
            sender_nickname: currentMember.nickname,
            message: newMessage.trim(),
            created_at: new Date().toISOString()
        };

        mergeMessages([msgData]);
        setNewMessage('');
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            sendMessage?.('typing', { value: false });
        }

        // Broadcast to peer immediately via Realtime if connected
        let sentViaRTC = false;
        if (sendMessage && connectionState === 'Connected') {
            sendMessage('chat', msgData);
            // Track for acknowledgement
            pendingMessagesRef.current.set(uniqueId, { payload: msgData, attempts: 0 });
            sentViaRTC = true;
        }

        // Fallback: If Realtime is not connected, save immediately to the database so the partner gets it in real-time
        if (!sentViaRTC) {
            console.log("[SYNC] Realtime not connected. Persisting message immediately to database for real-time fallback.");
            fetch('/api/love-space/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: msgData.id,
                    roomId,
                    senderNickname: msgData.sender_nickname,
                    message: msgData.message,
                    createdAt: msgData.created_at,
                }),
            }).catch(err => {
                console.error('[SYNC] Failed immediate message save:', err);
                // Fallback to lazy persistence if immediate save fails
                unsavedMessagesRef.current.push(msgData);
                hasUnsavedChangesRef.current = true;
            });
        } else {
            // Add to unsaved buffer for lazy DB persistence
            unsavedMessagesRef.current.push(msgData);
            hasUnsavedChangesRef.current = true;
        }

        setIsLoading(false);
    };

    const otherMember = members.find(m => m.id !== currentMember.id);
    const isPartnerOffline = !otherOnline;

    return (
        <div className="flex flex-col h-full bg-[#fffefe] dark:bg-slate-800 relative">
            {/* E2E Encryption Badge & Sync Status */}
            <div className="flex flex-col items-center py-2 bg-pink-50/30 dark:bg-pink-900/10 border-b border-pink-100/50 dark:border-pink-900/20 gap-1.5">
                {/* Offline Banner */}
                {isPartnerOffline && otherMember && (
                    <div className="w-full px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-amber-600 dark:text-amber-400 text-[10px] font-bold text-center">
                            ⚠️ {otherMember.nickname} is offline. Messages will deliver when they reconnect.
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-sm border border-pink-100/50 dark:border-pink-900/30">
                    <div className="w-3 h-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-pink-500/70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500/70 dark:text-pink-400/70">
                        End-to-end encrypted
                    </span>
                </div>

                {/* Sync Status Badge */}
                <div className="h-4 flex items-center justify-center">
                    {syncStatus === 'syncing' && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 dark:text-blue-400 animate-pulse">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Syncing to database...
                        </div>
                    )}
                    {syncStatus === 'saved' && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-green-500 dark:text-green-400">
                            All messages saved ✅
                        </div>
                    )}
                    {syncStatus === 'error' && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 dark:text-red-400">
                            Save failed ⚠️
                        </div>
                    )}
                    {syncStatus === 'idle' && hasUnsavedChangesRef.current && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 dark:text-amber-400">
                            Waiting to sync...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2 opacity-60">
                        <Heart className="w-12 h-12 text-pink-300 dark:text-pink-800" />
                        <p>No messages yet.</p>
                        <p className="text-sm">Send the first romantic text!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_nickname === currentMember.nickname;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? 'items-end ml-auto' : 'items-start'}`}
                            >
                                <div className={`text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 px-1 flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span className="font-medium">{msg.sender_nickname}</span>
                                    <span className="opacity-50 self-center">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                                <div
                                    className={`px-3 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-tr-sm shadow-sm'
                                        : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200 rounded-tl-sm shadow-sm'
                                        }`}
                                    style={{ wordBreak: 'break-word' }}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })
                )}
                {isPartnerTyping && (
                    <div className="flex items-start max-w-[80%]">
                        <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reaction Animations */}
            {activeReactions.map((reaction) => (
                <div 
                    key={reaction.id}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 text-4xl animate-[bounce_1s_ease-in-out_infinite] z-50 pointer-events-none drop-shadow-md"
                    style={{
                        animationName: 'float-up',
                        animationDuration: '3s',
                        animationTimingFunction: 'ease-out',
                        animationFillMode: 'forwards'
                    }}
                >
                    {reaction.emoji}
                </div>
            ))}

            {/* Floating Gemini-style Chat Input */}
            <div className="absolute bottom-4 left-0 right-0 px-4 z-10 pointer-events-none w-full flex justify-center">
                <form
                    onSubmit={handleSendMessage}
                    className="w-full max-w-[500px] flex items-end gap-2 p-2 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pink-100 dark:border-slate-700 pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-pink-200 dark:focus-within:ring-pink-900 relative"
                >
                    <textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleInputChange(e as any);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e as any);
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 min-h-[40px] max-h-[120px] border-0 bg-transparent focus:ring-0 focus:outline-none px-3 py-2.5 dark:text-white dark:placeholder:text-gray-500 shadow-none text-sm resize-none hide-scrollbar overflow-y-auto"
                        maxLength={500}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="rounded-full w-9 h-9 p-0 bg-pink-500 hover:bg-pink-600 shadow-sm text-white transition-transform active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:active:scale-100 mb-0.5 mr-0.5"
                    >
                        <Send className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

