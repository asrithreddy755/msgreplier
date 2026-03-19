import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleMute, useAudioMute } from '../hooks/useAudioMute';

export function MuteButton({ className }: { className?: string }) {
    const isMuted = useAudioMute();

    const baseClasses = "z-50 h-9 w-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all outline-none rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";
    const finalClasses = className ? `${baseClasses} ${className}` : `${baseClasses} absolute top-3 right-14`;

    return (
        <button
            onClick={toggleMute}
            className={finalClasses}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            title={isMuted ? "Unmute sound" : "Mute sound"}
        >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
    );
}
