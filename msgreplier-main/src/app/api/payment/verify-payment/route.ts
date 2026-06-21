import { NextResponse } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, validateRazorpayConfig } from "@/lib/rate-limiter";

// Fail fast check during build/startup
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
    // 1. Fail-fast environment validation checks
    validateRazorpayConfig();

    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    // 2. Rate Limiting (max 5 requests per minute per IP)
    const limitCheck = await rateLimit(ip, 5, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too Many Requests. Please try again later." },
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
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing required verification parameters." }, { status: 400 });
    }

    // 4. Verify HMAC SHA256 Signature using timingSafeEqual
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      console.warn(`⚠️ Payment verification failed: signature length mismatch. User ID: ${user.id}`);
      
      // Log failure to audit logs
      await supabaseAdmin.from("audit_logs").insert({
        event: "signature_failed",
        user_id: user.id,
        ip,
        metadata: {
          reason: "Signature length mismatch",
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
        },
      });

      return NextResponse.json({ success: false, error: "Invalid payment signature." }, { status: 400 });
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      console.warn(`⚠️ Payment verification failed: invalid signature. User ID: ${user.id}`);
      
      // Log failure to audit logs
      await supabaseAdmin.from("audit_logs").insert({
        event: "signature_failed",
        user_id: user.id,
        ip,
        metadata: {
          reason: "Signature value mismatch",
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
        },
      });

      return NextResponse.json({ success: false, error: "Invalid payment signature." }, { status: 400 });
    }

    // 5. Update local database payment record to status = 'verified' (Service Role client)
    const { error: dbError } = await supabaseAdmin
      .from("payments")
      .update({
        payment_id: razorpay_payment_id,
        status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Failed to update payment verification state:", dbError.message);
      return NextResponse.json({ success: false, error: "Failed to persist verification status." }, { status: 500 });
    }

    // 5b. Immediately activate the user's plan & credits so the dashboard updates
    //     without waiting for the Razorpay webhook. The webhook runs later as an
    //     idempotent backup (credit_transactions guard prevents double-crediting).
    try {
      // Fetch the plan from the payments record we just verified
      const { data: paymentRow } = await supabaseAdmin
        .from("payments")
        .select("plan")
        .eq("order_id", razorpay_order_id)
        .eq("user_id", user.id)
        .single();

      if (paymentRow?.plan) {
        const planName = paymentRow.plan as string;
        const PLAN_CREDITS: Record<string, number> = { starter: 20, creator: 50 };
        const creditsToAdd = PLAN_CREDITS[planName] ?? 0;

        // Try the atomic RPC first; if it doesn't exist, fall back to a simple update
        const { error: rpcErr } = await supabaseAdmin.rpc("increment_credits_and_set_plan", {
          p_user_id: user.id,
          p_plan: planName,
          p_credits_to_add: creditsToAdd,
        });

        if (rpcErr) {
          // Fallback: plain update (no credit increment — webhook will handle credits)
          console.warn("increment_credits_and_set_plan RPC unavailable, falling back to simple plan update:", rpcErr.message);
          await supabaseAdmin
            .from("profiles")
            .update({ plan: planName })
            .eq("id", user.id);
        }

        console.log(`✅ Plan activated immediately on verify: user=${user.id} plan=${planName}`);
      }
    } catch (activationErr: any) {
      // Non-fatal: the webhook will still update the plan later
      console.error("⚠️ Immediate plan activation failed (webhook will retry):", activationErr.message);
    }

    // 6. Log verification success to audit log
    await supabaseAdmin.from("audit_logs").insert({
      event: "payment_verified",
      user_id: user.id,
      ip,
      metadata: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
    });

    console.log(`🎉 Payment signature verified successfully. Order ID: ${razorpay_order_id}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error verifying payment:", message);
    return NextResponse.json({ success: false, error: "Verification failed. Please contact support." }, { status: 500 });
  }
}

