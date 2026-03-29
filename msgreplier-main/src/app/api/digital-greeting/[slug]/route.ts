import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../love-space/_supabase";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { client: supabase } = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("love_greetings")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Greeting not found" },
        { status: 404 }
      );
    }

    // Check expiration
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This greeting has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
