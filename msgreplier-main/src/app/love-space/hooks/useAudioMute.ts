"use client";

import { useSyncExternalStore } from 'react';

// Global mute state
let isMuted = false;
const listeners = new Set<() => void>();

// Toggle function exported for UI components
export const toggleMute = () => {
    isMuted = !isMuted;
    listeners.forEach((listener) => listener());
};

// Getter for the sound playback check
export const getIsMuted = () => isMuted;

// Hook to subscribe React components to the global mute state
export function useAudioMute() {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getIsMuted,
        getIsMuted // Server fallback
    );
}
