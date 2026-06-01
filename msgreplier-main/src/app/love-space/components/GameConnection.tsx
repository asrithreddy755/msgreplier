// src/app/love-space/components/GameConnection.tsx
"use client";

import { ConnectionState } from "@/hooks/useLoveSpaceRealtime";

import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface GameConnectionProps {
    connectionState: ConnectionState;
    latencyMs?: number;
    rtcStats?: {
        messagesSent: number;
        messagesReceived: number;
        packetLoss: number;
        jitter: number;
        currentRoundTripTime: number;
        connectionType: string;
        remoteCandidateType: string;
    } | null;
}

function getQualityLabel(latencyMs: number): { label: string; color: string; dot: string } {
    if (latencyMs === 0) return { label: "Checking...", color: "text-gray-400", dot: "bg-gray-400" };
    if (latencyMs < 100) return { label: "Excellent", color: "text-green-500 dark:text-green-400", dot: "bg-green-400" };
    if (latencyMs < 200) return { label: "Good", color: "text-yellow-500 dark:text-yellow-400", dot: "bg-yellow-400" };
    if (latencyMs < 450) return { label: "Fair", color: "text-orange-500 dark:text-orange-400", dot: "bg-orange-400" };
    return { label: "Poor", color: "text-red-500 dark:text-red-400", dot: "bg-red-400" };
}

export function GameConnection({ connectionState, latencyMs = 0, rtcStats = null }: GameConnectionProps) {

    let bgColor = "bg-gray-100 dark:bg-slate-800";
    let textColor = "text-gray-500 dark:text-gray-400";
    let icon = <Loader2 className="w-3 h-3 animate-spin mr-1.5" />;

    if (connectionState === "Connected") {
        bgColor = "bg-green-100 dark:bg-green-900/40";
        textColor = "text-green-600 dark:text-green-400";
        icon = <Wifi className="w-3 h-3 mr-1.5" />;
    } else if (connectionState === "Opponent disconnected") {
        bgColor = "bg-red-100 dark:bg-red-900/40";
        textColor = "text-red-600 dark:text-red-400";
        icon = <WifiOff className="w-3 h-3 mr-1.5 animate-pulse" />;
    } else if (connectionState === "Connecting...") {
        bgColor = "bg-amber-100 dark:bg-amber-900/40";
        textColor = "text-amber-600 dark:text-amber-400";
        icon = <Loader2 className="w-3 h-3 animate-spin mr-1.5" />;
    }

    const quality = getQualityLabel(latencyMs);

    return (
        <div className="relative flex items-center gap-2">
            {/* Main Status Pill */}
            <div
                className={`flex items-center justify-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-colors duration-300 ${bgColor} ${textColor}`}
            >
                {icon}
                <span className="uppercase tracking-wider">{connectionState}</span>
            </div>

            {/* Latency Indicator – only when connected */}
            {connectionState === "Connected" && (
                <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-[10px] font-semibold shadow-sm`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${quality.dot} shadow-[0_0_5px_rgba(0,0,0,0.1)]`} />
                    <span className={quality.color}>
                        {quality.label} {latencyMs > 0 ? `(${latencyMs}ms)` : ""}
                    </span>
                </div>
            )}

        </div>
    );
}
