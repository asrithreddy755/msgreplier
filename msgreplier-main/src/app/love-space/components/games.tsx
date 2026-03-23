export * from './chat';
export * from './xox';
export { Ludo } from './ludo/ludo';
export * from './snake-ladder';
export * from './love-quiz';

import { Signal, SignalLow, SignalZero } from 'lucide-react';

export function NetworkStatus({ connectionStatus }: { connectionStatus: 'connected' | 'reconnecting' | 'disconnected' }) {
    const config = {
        connected: {
            icon: Signal,
            color: 'text-green-500',
            dot: 'bg-green-500',
            tooltip: 'Partner connected',
            pulse: ''
        },
        reconnecting: {
            icon: SignalLow,
            color: 'text-amber-500',
            dot: 'bg-amber-500',
            tooltip: 'Reconnecting...',
            pulse: 'animate-pulse'
        },
        disconnected: {
            icon: SignalZero,
            color: 'text-red-500',
            dot: 'bg-red-500',
            tooltip: 'Partner lost connection',
            pulse: ''
        }
    };

    const { icon: Icon, color, dot, tooltip, pulse } = config[connectionStatus];

    return (
        <div className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 dark:bg-slate-900/40 border border-white/10 backdrop-blur-sm transition-all ${pulse}`} title={tooltip}>
            <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} />
            <div className={`w-1.5 h-1.5 rounded-full ${dot} shadow-[0_0_5px_currentColor]`} />
            
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 shadow-xl">
                {tooltip}
            </div>
        </div>
    );
}

