"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { RealtimeMessageType } from '@/lib/realtime/types';
import { motion, AnimatePresence } from 'framer-motion';

interface WakeUpButtonProps {
    sendMessage?: (type: RealtimeMessageType, payload?: any) => void;
    currentMember: { id: string; nickname: string };
    targetNickname: string;
    gameName: string;
    onRequestSync?: () => void;
}

export function WakeUpButton({ sendMessage, currentMember, targetNickname, gameName, onRequestSync }: WakeUpButtonProps) {
    const [cooldown, setCooldown] = useState(0);
    const COOLDOWN_TIME = 5;

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleWakeUp = () => {
        if (cooldown > 0 || !sendMessage) return;

        // Layer 1: Send wake_up message
        sendMessage('wake_up', { 
            game: gameName, 
            from: currentMember.nickname,
            senderId: currentMember.id
        });

        // Layer 2: Trigger silent sync
        if (onRequestSync) {
            onRequestSync();
        }
        
        setCooldown(COOLDOWN_TIME);
    };

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="outline"
                disabled={cooldown > 0}
                onClick={handleWakeUp}
                className="relative overflow-hidden group border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full px-4 h-8 transition-all active:scale-95"
            >
                <Bell className={`w-3.5 h-3.5 mr-1.5 ${cooldown > 0 ? 'opacity-50' : 'animate-bounce group-hover:animate-none'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Wake Up</span>
                
                {/* Cooldown Animation Overlay */}
                <AnimatePresence>
                    {cooldown > 0 && (
                        <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: COOLDOWN_TIME, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-full bg-orange-500/10 pointer-events-none"
                        />
                    )}
                </AnimatePresence>
            </Button>
            
            {cooldown > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cooldown}
                </div>
            )}
        </div>
    );
}
