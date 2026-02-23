import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Love Score Quiz - Test Your Relationship | MsgReplier',
    description:
        'Create a custom Love Score Quiz and test your partner or crush! Set a time limit, craft your own secret questions, and share a custom link to see how well they really know you.',
    openGraph: {
        title: 'Love Score Quiz - Test Your Relationship',
        description: 'Create a custom Love Score Quiz and test your partner or crush! Set a time limit, craft your own secret questions, and share a custom link to see how well they really know you.',
        url: 'https://msgreplier.com/love-score',
        siteName: 'MsgReplier',
        type: 'website',
    },
};

export default function LoveScoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
