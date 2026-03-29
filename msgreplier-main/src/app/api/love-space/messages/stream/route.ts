import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../_supabase';


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const { client: supabaseAdmin, envStatus } = getSupabaseAdmin();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: missing Supabase config.', env: envStatus }, { status: 500 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let lastCreatedAt = new Date(0).toISOString();
                const lastIds = new Set<string>();

                const send = (data: unknown, event?: string) => {
                    const payload = `${event ? `event: ${event}\n` : ''}data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(payload));
                };

                const latestRes = await supabaseAdmin
                    .from('love_messages')
                    .select('id, room_id, sender_nickname, message, created_at')
                    .eq('room_id', roomId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (latestRes.data?.created_at) {
                    lastCreatedAt = latestRes.data.created_at;
                    lastIds.add(latestRes.data.id);
                    send(latestRes.data, 'message');
                }

                send({ ok: true }, 'ready');

                const interval = setInterval(async () => {
                    const { data } = await supabaseAdmin
                        .from('love_messages')
                        .select('id, room_id, sender_nickname, message, created_at')
                        .eq('room_id', roomId)
                        .gt('created_at', lastCreatedAt)
                        .order('created_at', { ascending: true });

                    if (data && data.length > 0) {
                        for (const msg of data) {
                            if (lastIds.has(msg.id)) continue;
                            lastIds.add(msg.id);
                            lastCreatedAt = msg.created_at;
                            send(msg, 'message');
                        }
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
