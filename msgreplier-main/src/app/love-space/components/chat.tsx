"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { LoveMessage, LoveRoomMember } from '@/types/love-space';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Heart } from 'lucide-react';
import { WebRTCMessageType } from '@/lib/webrtc/dataChannel';

export function Chat({ 
    roomId, 
    currentMember, 
    onNewMessage,
    sendMessage,
    registerHandler,
    unregisterHandler
}: { 
    roomId: string;
    currentMember: LoveRoomMember;
    onNewMessage?: () => void;
    sendMessage?: (type: WebRTCMessageType, payload?: any) => void;
    registerHandler?: (type: WebRTCMessageType, handler: (payload: any) => void) => void;
    unregisterHandler?: (type: WebRTCMessageType, handler?: (payload: any) => void) => void;
}) {
    const [messages, setMessages] = useState<LoveMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pendingMessagesRef = useRef<Map<string, { payload: any, attempts: number }>>(new Map());
    const messagesRef = useRef<LoveMessage[]>([]);
    const lastSyncRequestAtRef = useRef(0);
    const chatBackupKey = useMemo(() => `love_chat_backup_${roomId}`, [roomId]);

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
        return merged;
    }, [persistMessagesBackup]);

    const requestSync = useCallback((reason: string) => {
        if (!sendMessage) return;
        const now = Date.now();
        if (now - lastSyncRequestAtRef.current < 1200) return;
        lastSyncRequestAtRef.current = now;
        sendMessage('chat_sync_request', { roomId, senderId: currentMember.id, reason, sentAt: now });
    }, [sendMessage, roomId, currentMember.id]);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                const backupRaw = localStorage.getItem(chatBackupKey);
                if (backupRaw) {
                    const backup = JSON.parse(backupRaw) as LoveMessage[];
                    if (Array.isArray(backup) && backup.length > 0) {
                        mergeMessages(backup);
                    }
                }
            } catch {
                return;
            }

            try {
                const result = await fetch(`/api/love-space/messages?roomId=${roomId}`, { cache: 'no-store' }).then(r => r.json());
                if (!isMounted) return;
                if (Array.isArray(result?.messages)) {
                    mergeMessages(result.messages);
                }
            } catch (error) {
                console.error('[Chat] Failed to load persisted messages', error);
            } finally {
                if (isMounted) requestSync('init');
            }
        };
        if (roomId) init();
        return () => {
            isMounted = false;
        };
    }, [roomId, chatBackupKey, mergeMessages, requestSync]);


    // WebRTC Real-time chat integration
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
            sendMessage?.('chat_sync_state', {
                messages: messagesRef.current.slice(-500),
                updatedAt: Date.now(),
            });
        };

        const handleSyncState = (payload: any) => {
            if (!payload || !Array.isArray(payload.messages)) return;
            mergeMessages(payload.messages);
        };

        registerHandler('chat', handleIncomingChat);
        registerHandler('ack', handleAck);
        registerHandler('typing', handleTyping);
        registerHandler('reaction', handleReaction);
        registerHandler('chat_sync_request', handleSyncRequest);
        registerHandler('chat_sync_state', handleSyncState);
        requestSync('handler_registered');

        return () => {
             unregisterHandler('chat', handleIncomingChat);
             unregisterHandler('ack', handleAck);
             unregisterHandler('typing', handleTyping);
             unregisterHandler('reaction', handleReaction);
             unregisterHandler('chat_sync_request', handleSyncRequest);
             unregisterHandler('chat_sync_state', handleSyncState);
        };
    }, [registerHandler, unregisterHandler, roomId, sendMessage, mergeMessages, requestSync, currentMember.id]);

    // Retry loop for unacknowledged messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (!sendMessage) return;
            pendingMessagesRef.current.forEach((data, id) => {
                if (data.attempts >= 5) {
                    console.error("Max retries reached for message:", id);
                    pendingMessagesRef.current.delete(id);
                    return;
                }
                data.attempts++;
                sendMessage('chat', data.payload);
            });
        }, 3000); // 3 seconds retry interval

        return () => clearInterval(interval);
    }, [sendMessage]);


    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

        // Send via WebRTC DataChannel with ID for ACK tracking
        if (sendMessage) {
            const payload = {
                id: uniqueId,
                sender_nickname: currentMember.nickname,
                message: msgData.message,
                created_at: msgData.created_at
            };
            
            pendingMessagesRef.current.set(uniqueId, { payload, attempts: 1 });
            sendMessage('chat', payload);
            
            // Clear typing state
            sendMessage('typing', { value: false });
        }

        fetch('/api/love-space/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: uniqueId,
                roomId,
                senderNickname: currentMember.nickname,
                message: msgData.message,
                createdAt: msgData.created_at,
            }),
        }).catch((error) => {
            console.error('[Chat] Failed to persist message', error);
        });

        setIsLoading(false);

    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         setNewMessage(e.target.value);
         
         if (sendMessage) {
             sendMessage('typing', { value: true });
             
             if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
             
             typingTimeoutRef.current = setTimeout(() => {
                 sendMessage('typing', { value: false });
             }, 2000);
         }
    };

    const handleSendReaction = (emoji: string) => {
         // Optimistic UI for sender
         const id = crypto.randomUUID();
         setActiveReactions(prev => [...prev, { id, emoji }]);
         setTimeout(() => {
             setActiveReactions(prev => prev.filter(r => r.id !== id));
         }, 3000);

         if (sendMessage) {
             sendMessage('reaction', { emoji });
         }
    };

    return (
        <div className="flex flex-col h-full bg-[#fffefe] dark:bg-slate-800 relative">
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
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
                                className={`flex flex-col max-w-[80%] ${isMe ? 'items-end ml-auto' : 'items-start'}`}
                            >
                                <div className={`text-xs text-gray-400 dark:text-gray-500 mb-1 px-1 flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span>{msg.sender_nickname}</span>
                                    <span className="opacity-50 text-[10px] self-center">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                                <div
                                    className={`px-4 py-2 rounded-2xl ${isMe
                                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-tr-sm shadow-md'
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
            <div className="absolute bottom-4 left-0 right-0 px-4 z-10 pointer-events-none flex flex-col items-center gap-2">
                {/* Emoji Bar */}
                <div className="pointer-events-auto flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-white/20 dark:border-slate-800">
                    {['❤️', '😂', '🥺', '🔥', '✨'].map(emoji => (
                         <button 
                             key={emoji}
                             onClick={() => handleSendReaction(emoji)}
                             className="hover:scale-125 transition-transform text-xl active:scale-95"
                         >
                             {emoji}
                         </button>
                    ))}
                </div>

                <form
                    onSubmit={handleSendMessage}
                    className="flex max-w-3xl mx-auto items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pink-100 dark:border-slate-700 pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-pink-200 dark:focus-within:ring-pink-900"
                >
                    <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a sweet message..."
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 dark:text-white dark:placeholder:text-gray-500 shadow-none h-10"
                        maxLength={500}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="rounded-full w-10 h-10 p-0 bg-pink-500 hover:bg-pink-600 shadow-md text-white transition-transform active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:active:scale-100"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
