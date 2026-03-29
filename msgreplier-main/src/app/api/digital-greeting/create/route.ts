import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../love-space/_supabase";
import { v4 as uuidv4 } from "uuid";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      recipient_name, 
      sender_name, 
      relationship, 
      occasion, 
      message, 
      theme, 
      sender_avatar,
      photo_url,
      music_id,
      reveal_type
    } = body;

    if (!recipient_name || !sender_name || !relationship || !occasion || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { client: supabase } = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 }
      );
    }

    // Generate a unique slug using a short UUID
    const slug = uuidv4().split('-')[0];

    const { data, error } = await supabase
      .from("love_greetings")
      .insert([
        {
          slug,
          recipient_name,
          sender_name,
          relationship,
          occasion,
          message,
          theme: theme || 'hearts',
          sender_avatar: sender_avatar || '💌',
          photo_url,
          music_id: music_id || 'none',
          reveal_type: reveal_type || 'envelope',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating digital greeting:", error);
      return NextResponse.json(
        { error: "Failed to create digital greeting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug: data.slug });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
