import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Love Rapid — 2-Player Rapid-Fire Couple Questions | Love Space',
    description:
        'A fast, fun rapid-fire question game for couples. No login needed — create a session, share your code, and see how well you really know each other!',
    keywords: [
        'couple questions game',
        'love rapid',
        'rapid fire couples quiz',
        'love space',
        'couple game no login',
        'fun questions for couples',
    ],
    alternates: {
        canonical: 'https://msgreplier.com/love-space/love-rapid',
    },
    openGraph: {
        title: 'Love Rapid — Rapid-Fire Couple Questions',
        description:
            'Answer 5 fun questions about each other simultaneously, then reveal and compare. No login, no timer — just you two!',
        url: 'https://msgreplier.com/love-space/love-rapid',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Love Rapid — How Well Do You Know Your Partner?',
        description:
            'A 2-player rapid-fire question game for couples. Answer 5 questions, then reveal your answers side by side!',
    },
};

export default function LoveRapidLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
