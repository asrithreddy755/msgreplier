"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Heart } from 'lucide-react';
import { toast } from 'sonner';

function JoinHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            router.push('/love-space');
            return;
        }

        const joinByCode = async () => {
            try {
                const response = await fetch(`/api/love-space/join-by-code?code=${code}`);
                const data = await response.json();

                if (response.ok && data.roomId) {
                    router.push(`/love-space/${data.roomId}`);
                } else {
                    setError(data.error || "Failed to join room.");
                    toast.error(data.error || "Failed to join room.");
                    setTimeout(() => router.push('/love-space'), 3000);
                }
            } catch (err) {
                setError("Something went wrong. Please try again.");
                toast.error("Something went wrong.");
                setTimeout(() => router.push('/love-space'), 3000);
            }
        };

        joinByCode();
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4 text-center">
                <Heart className="w-16 h-16 text-red-400 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold text-gray-800">Oops!</h1>
                <p className="text-gray-500 mt-2">{error}</p>
                <p className="text-sm text-gray-400 mt-4">Redirecting you back...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Joining Room...</h1>
            <p className="text-gray-500 mt-2">Connecting you to your partner.</p>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            </div>
        }>
            <JoinHandler />
        </Suspense>
    );
}
