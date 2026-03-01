import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../_supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const gameType = searchParams.get('gameType');

        if (!roomId || !gameType) {
            return NextResponse.json({ error: 'roomId and gameType are required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let lastUpdatedAt = new Date(0).toISOString();

                const send = (data: unknown, event?: string) => {
                    const payload = `${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(payload));
                };

                const latestRes = await supabaseAdmin
                    .from('love_games')
                    .select('*')
                    .eq('room_id', roomId)
                    .eq('game_type', gameType)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (latestRes.data?.updated_at) {
                    lastUpdatedAt = latestRes.data.updated_at;
                    send(latestRes.data, 'game');
                }

                send({ ok: true }, 'ready');

                const interval = setInterval(async () => {
                    const { data } = await supabaseAdmin
                        .from('love_games')
                        .select('*')
                        .eq('room_id', roomId)
                        .eq('game_type', gameType)
                        .gt('updated_at', lastUpdatedAt)
                        .order('updated_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (data?.updated_at) {
                        lastUpdatedAt = data.updated_at;
                        send(data, 'game');
                    }
                }, 2000);

                request.signal.addEventListener('abort', () => {
                    clearInterval(interval);
                    controller.close();
                });
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive'
            }
        });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
