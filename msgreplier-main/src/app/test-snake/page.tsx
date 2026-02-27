"use client";

import { SnakeLadder } from "@/app/love-space/components/snake-ladder";
import { LoveRoomMember } from "@/types/love-space";

export default function SnakeLadderTestPage() {
    // Dummy member to bypass Supabase room requirement
    const dummyMember: LoveRoomMember = {
        id: "dummy-user-123",
        room_id: "test-room",
        nickname: "Test Player 1",
        joined_at: new Date().toISOString()
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-6 border-4 border-pink-100">
                <h1 className="text-center font-bold text-gray-400 mb-4 text-sm uppercase tracking-widest">
                    Sandbox Test Mode
                </h1>

                {/* The game component expecting a roomId and a currentMember */}
                <div className="h-[600px] w-full overflow-y-auto">
                    <SnakeLadder roomId="sandbox-test-room" currentMember={dummyMember} />
                </div>
            </div>
        </div>
    );
}
