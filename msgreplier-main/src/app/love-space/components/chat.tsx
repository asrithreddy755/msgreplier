"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveMessage, LoveRoomMember } from '@/types/love-space';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Heart } from 'lucide-react';

export function Chat({ roomId, currentMember, onNewMessage }: { roomId: string, currentMember: LoveRoomMember, onNewMessage?: () => void }) {
    const [messages, setMessages] = useState<LoveMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch initial messages and subscribe to new ones
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('love_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data as LoveMessage[]);
            }
        };
        fetchMessages();

        // Subscribe to real-time additions via Broadcast
        const channel = supabase.channel(`chat_broadcast_${roomId}`)
            .on(
                'broadcast',
                { event: 'new_message' },
                (payload: { payload: LoveMessage }) => {
                    setMessages((prev) => {
                        if (prev.some(m => m.id === payload.payload.id || (m.message === payload.payload.message && m.sender_nickname === payload.payload.sender_nickname && Math.abs(new Date(m.created_at).getTime() - new Date(payload.payload.created_at).getTime()) < 5000))) {
                            return prev;
                        }

                        // Notify parent of new message if it's from the other person
                        if (payload.payload.sender_nickname !== currentMember.nickname && onNewMessage) {
                            onNewMessage();
                        }

                        return [...prev, payload.payload];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        setIsLoading(true);
        const tempId = crypto.randomUUID();
        const msgData: LoveMessage = {
            id: tempId,
            room_id: roomId,
            sender_nickname: currentMember.nickname,
            message: newMessage.trim(),
            created_at: new Date().toISOString()
        };

        // 1. Optimistic UI update (Instant for sender)
        setMessages((prev) => [...prev, msgData]);
        setNewMessage('');

        // 2. Broadcast to other clients (Instant for receiver)
        const channel = supabase.channel(`chat_broadcast_${roomId}`);
        await channel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: msgData
        });

        // 3. Save to DB in background
        const { error } = await supabase
            .from('love_messages')
            .insert([{
                room_id: roomId,
                sender_nickname: currentMember.nickname,
                message: msgData.message
            }]);

        if (error) {
            console.error("Error saving message:", error);
        }

        setIsLoading(false);
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
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Gemini-style Chat Input */}
            <div className="absolute bottom-4 left-0 right-0 px-4 z-10 pointer-events-none">
                <form
                    onSubmit={handleSendMessage}
                    className="flex max-w-3xl mx-auto items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-pink-100 dark:border-slate-700 pointer-events-auto transition-all focus-within:ring-2 focus-within:ring-pink-200 dark:focus-within:ring-pink-900"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
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
