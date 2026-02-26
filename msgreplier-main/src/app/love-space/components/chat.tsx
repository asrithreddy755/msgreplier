"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LoveMessage, LoveRoomMember } from '@/types/love-space';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Heart } from 'lucide-react';

export function Chat({ roomId, currentMember }: { roomId: string, currentMember: LoveRoomMember }) {
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

        // Subscribe to real-time additions
        const channel = supabase.channel(`chat_${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'love_messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as LoveMessage]);
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
        const msgData = {
            room_id: roomId,
            sender_nickname: currentMember.nickname,
            message: newMessage.trim(),
        };

        const { error } = await supabase
            .from('love_messages')
            .insert([msgData]);

        if (error) {
            console.error("Error sending message:", error);
        } else {
            setNewMessage('');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#fffefe] relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                        <Heart className="w-12 h-12 text-pink-300" />
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
                                <div className={`text-xs text-gray-400 mb-1 px-1 flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span>{msg.sender_nickname}</span>
                                    <span className="opacity-50 text-[10px] self-center">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={`px-4 py-2 rounded-2xl ${isMe
                                            ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-tr-sm shadow-md'
                                            : 'bg-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
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

            <div className="p-3 bg-white border-t border-pink-100 z-10 sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a sweet message..."
                        className="flex-1 rounded-full bg-pink-50 border-transparent focus-visible:ring-pink-300 shadow-inner"
                        maxLength={500}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="rounded-full w-10 h-10 p-0 bg-pink-500 hover:bg-pink-600 shadow-md text-white transition-transform active:scale-95 flex-shrink-0"
                    >
                        <Send className="w-4 h-4 ml-1" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
