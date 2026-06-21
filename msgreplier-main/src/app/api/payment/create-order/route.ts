import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, validateRazorpayConfig } from "@/lib/rate-limiter";

// ─────────────────────────────────────────────
// Production Plans & Pricing (amounts in ₹)
// ─────────────────────────────────────────────
const PLAN_PRICES: Record<string, Record<string, number>> = {
  starter: { monthly: 49, "3month": 132, annual: 470 },
  creator: { monthly: 99, "3month": 267, annual: 950 },
};

const PLAN_CREDITS: Record<string, number> = {
  starter: 20,
  creator: 50,
};

// Fail fast during build/startup validation
try {
  validateRazorpayConfig();
} catch (e: any) {
  console.error("Initialization check failed:", e.message);
}

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Fail-fast environment secret checks
    validateRazorpayConfig();

    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    // 2. Rate Limiting (max 5 requests per minute per IP)
    const limitCheck = await rateLimit(ip, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too Many Requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitCheck.retryAfterSeconds),
            "X-RateLimit-Limit": String(limitCheck.limit),
            "X-RateLimit-Remaining": String(limitCheck.remaining),
            "X-RateLimit-Reset": limitCheck.reset,
          },
        }
      );
    }

    // 3. User Authentication
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { planName, billingCycle = "monthly" } = await request.json();

    // 4. Validate Inputs
    const plan = planName?.toLowerCase() as string;
    if (!PLAN_PRICES[plan]) {
      return NextResponse.json({ error: `Unknown plan: ${planName}` }, { status: 400 });
    }

    const validCycles = ["monthly", "3month", "annual"];
    if (!validCycles.includes(billingCycle)) {
      return NextResponse.json({ error: `Unknown billing cycle: ${billingCycle}` }, { status: 400 });
    }

    // Initialize Razorpay client
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const amountInRupees = PLAN_PRICES[plan][billingCycle];
    const amountInPaise = amountInRupees * 100;

    // Calculate credits to add
    const baseCredits = PLAN_CREDITS[plan];
    let credits = baseCredits;
    if (billingCycle === "3month") credits = baseCredits * 3;
    else if (billingCycle === "annual") credits = baseCredits * 12;

    // 5. Fraud Detection: Alert if >50 order creations/hour
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("payments")
        .select("*", { count: "exact", head: true })
        .gt("created_at", oneHourAgo);

      if (count !== null && count >= 50) {
        console.warn(`🚨 FRAUD ALERT: High rate of order creations detected! (${count} orders in the last hour)`);
        await supabaseAdmin.from("audit_logs").insert({
          event: "security_alert",
          user_id: user.id,
          ip,
          metadata: {
            reason: "High rate of order creation",
            count_last_hour: count,
            triggered_by_user: user.email,
          },
        });
      }
    } catch (fraudErr) {
      console.error("Fraud verification check failed:", fraudErr);
    }

    // 6. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${plan}_${billingCycle}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan,
        credits: String(credits),
        billing_cycle: billingCycle,
      },
    });

    // 7. Write Created Payment record to DB (Service Role Client)
    const { error: dbError } = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      order_id: order.id,
      amount: amountInPaise,
      plan: plan,
      status: "created",
    });

    if (dbError) {
      console.error("Database insert error:", dbError.message);
      return NextResponse.json({ error: "Failed to persist order transaction." }, { status: 500 });
    }

    // 8. Log Audit Log event
    await supabaseAdmin.from("audit_logs").insert({
      event: "payment_created",
      user_id: user.id,
      ip,
      metadata: {
        order_id: order.id,
        amount: amountInPaise,
        plan,
        credits,
      },
    });

    console.log(`✅ Razorpay order created: ${order.id} | User: ${user.id} | Plan: ${plan} | Price: ₹${amountInRupees}`);

    // 9. Return ONLY required frontend parameters
    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error creating Razorpay order:", message);
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }
}

