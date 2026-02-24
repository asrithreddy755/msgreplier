import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const runtime = 'edge';

// We need to proxy matching requests from /api/supabase/* to https://[PROJECT_REF].supabase.co/*
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function OPTIONS(req: NextRequest) {
    // Handle CORS preflight
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        },
    });
}

async function handleProxy(req: NextRequest, params: Promise<{ path: string[] }>) {
    try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            return NextResponse.json({ error: "Server missing Supabase credentials" }, { status: 500 });
        }

        const { path } = await params;
        const relativePath = path ? path.join('/') : '';

        // Extract query parameters from the original request
        const urlObj = new URL(req.url);
        const searchParams = urlObj.search;

        // Construct the real Supabase URL
        const targetUrl = `${SUPABASE_URL}/${relativePath}${searchParams}`;

        // Forward headers, explicitly setting Supabase auth headers if missing
        const headers = new Headers(req.headers);
        headers.delete("host"); // Let fetch set the correct host
        headers.delete("connection");

        // Supabase REST API requires these headers
        if (!headers.has("apikey")) {
            headers.set("apikey", SUPABASE_ANON_KEY);
        }
        if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
        }

        // Forward body if present
        let body: BodyInit | null = null;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await req.arrayBuffer();
        }

        console.log(`[Proxy] Forwarding ${req.method} request to: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
            // Disable default caching to ensure live DB reads
            cache: 'no-store'
        });

        // Pass back the Supabase response exactly
        const responseData = await response.arrayBuffer();

        const responseHeaders = new Headers(response.headers);
        // Sometimes Supabase returns headers that we don't need to forward or that conflict
        responseHeaders.delete("content-encoding");

        return new NextResponse(responseData, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Internal Server Error proxying to Supabase" },
            { status: 500 }
        );
    }
}
