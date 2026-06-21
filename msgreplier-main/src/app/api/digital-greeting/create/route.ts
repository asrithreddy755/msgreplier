import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../love-space/_supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Strict auth check: user must be logged in.
    let userId: string;
    try {
      const authClient = await createSupabaseServerClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required to create a Wishes Website" },
          { status: 401 }
        );
      }
      userId = user.id;
    } catch (err) {
      return NextResponse.json(
        { error: "Authentication check failed" },
        { status: 401 }
      );
    }

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

    // Fetch user plan details to verify website limits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile plan:", profileError);
      // Fallback to free plan rather than crashing if profile is missing
    }

    const plan = profile?.plan || 'free';
    const limit = plan === 'creator' ? 100 : plan === 'starter' ? 25 : 12;

    // Enforce plan-specific website limit
    const { count, error: countError } = await supabase
      .from("love_greetings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error checking website count limit:", countError);
      return NextResponse.json(
        { error: "Failed to verify website limits" },
        { status: 500 }
      );
    }

    if (count !== null && count >= limit) {
      return NextResponse.json(
        { error: `You have reached the limit of ${limit} websites for your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Please upgrade your plan to create more websites.` },
        { status: 403 }
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
          user_id: userId,  // null for anonymous users, user UUID for logged-in users
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
