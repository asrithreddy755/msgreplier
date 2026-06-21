import { NextResponse } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, validateRazorpayConfig } from "@/lib/rate-limiter";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  
  // 1. Rate Limiting (max 60 requests per minute per IP for webhook safety)
  const limitCheck = await rateLimit(ip, 60, 60000);
  if (!limitCheck.success) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429 }
    );
  }

  // 2. Validate Secrets Exist
  try {
    validateRazorpayConfig();
  } catch (err: any) {
    console.error("🚨 Webhook configuration check failed:", err.message);
    return NextResponse.json({ error: "Webhook signature key missing" }, { status: 500 });
  }

  let body = "";
  try {
    body = await request.text();
  } catch (readErr: any) {
    console.error("❌ Failed to read request body:", readErr.message);
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  const signature = reqHeaders.get("x-razorpay-signature");
  if (!signature) {
    console.warn(`⚠️ Webhook hit missing X-Razorpay-Signature header from IP: ${ip}`);
    await supabaseAdmin.from("audit_logs").insert({
      event: "signature_failed",
      ip,
      metadata: { reason: "Missing x-razorpay-signature header" }
    });
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }

  // 3. Verify HMAC SHA256 Signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    console.warn(`⚠️ Webhook signature length mismatch from IP: ${ip}`);
    await supabaseAdmin.from("audit_logs").insert({
      event: "signature_failed",
      ip,
      metadata: { reason: "Signature length mismatch" }
    });
    return NextResponse.json({ error: "Invalid signature length" }, { status: 400 });
  }

  const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  if (!isValid) {
    console.warn(`⚠️ Webhook signature value mismatch from IP: ${ip}`);
    await supabaseAdmin.from("audit_logs").insert({
      event: "signature_failed",
      ip,
      metadata: { reason: "HMAC signature mismatch" }
    });
    return NextResponse.json({ error: "Invalid signature verification" }, { status: 400 });
  }

  // Signature verified! Parse payload.
  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch (parseErr: any) {
    console.error("❌ Failed to parse webhook JSON body:", parseErr.message);
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const eventId = payload.id || `evt_${Date.now()}`;
  const eventType = payload.event;

  // 4. Save Event in webhook_events Table with 'received' status (Idempotency and Retry Safety)
  const { error: insertEventErr } = await supabaseAdmin.from("webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
    payload: payload,
    status: "received",
  });

  if (insertEventErr) {
    // If event_id unique constraint fails, it means we already received this webhook event.
    if (insertEventErr.code === "23505") {
      console.log(`ℹ️ Webhook event ${eventId} already received. Skipping.`);
      return NextResponse.json({ success: true, message: "Webhook already processed" });
    }
    console.error(`❌ Failed to store webhook event ${eventId}:`, insertEventErr.message);
    return NextResponse.json({ error: "Failed to persist webhook event" }, { status: 500 });
  }

  // Log Webhook Receipt
  await supabaseAdmin.from("audit_logs").insert({
    event: "webhook_received",
    ip,
    metadata: {
      event_id: eventId,
      event_type: eventType,
    }
  });

  try {
    // Update status to processing
    await supabaseAdmin
      .from("webhook_events")
      .update({ status: "processing" })
      .eq("event_id", eventId);

    // 5. Handle Webhook Events
    if (eventType === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount;
      const notes = paymentEntity.notes || {};
      
      const userId = notes.user_id;
      const plan = notes.plan;
      const credits = notes.credits ? parseInt(notes.credits, 10) : 0;

      if (!userId || !plan || credits <= 0) {
        console.error(`❌ Invalid metadata notes in payment captured event: ${eventId}`);
        await supabaseAdmin.from("webhook_events").update({ status: "failed" }).eq("event_id", eventId);
        await supabaseAdmin.from("audit_logs").insert({
          event: "payment_failed",
          ip,
          metadata: {
            reason: "Invalid notes metadata in webhook payload",
            event_id: eventId,
            notes
          }
        });
        return NextResponse.json({ error: "Invalid metadata notes" }, { status: 200 }); // Do not retry for bad metadata
      }

      // Execute SQL Transaction RPC (verifies ownership, status created/verified, updates plan & credits, writes audit logs)
      const { data: success, error: rpcError } = await supabaseAdmin.rpc("process_captured_payment", {
        p_event_id: eventId,
        p_user_id: userId,
        p_order_id: orderId,
        p_payment_id: paymentId,
        p_amount: amount,
        p_plan: plan,
        p_credits_to_add: credits,
        p_ip: ip
      });

      if (rpcError) {
        console.error(`❌ RPC Transaction error processing payment captured:`, rpcError.message);
        await supabaseAdmin.from("webhook_events").update({ status: "failed" }).eq("event_id", eventId);
        return NextResponse.json({ error: "Failed to process payment capture transaction" }, { status: 500 });
      }

      if (!success) {
        console.warn(`⚠️ Webhook payment capture transaction completed but returned FALSE (already processed or order mismatch). Event ID: ${eventId}`);
      } else {
        console.log(`🎉 Webhook processed successfully. Credits granted to user: ${userId} (${credits} credits for ${plan})`);
      }

    } else if (eventType === "payment.failed") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const userId = paymentEntity.notes?.user_id;

      // Update payment status to failed
      await supabaseAdmin
        .from("payments")
        .update({
          payment_id: paymentId,
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId);

      // Log failure in audit logs
      await supabaseAdmin.from("audit_logs").insert({
        event: "payment_failed",
        user_id: userId,
        ip,
        metadata: {
          order_id: orderId,
          payment_id: paymentId,
          reason: paymentEntity.error_description || "Razorpay reported payment failed event"
        }
      });

      // 6. Fraud Detection Alert: Alert if >20 failed payments today
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabaseAdmin
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "failed")
          .gt("updated_at", twentyFourHoursAgo);

        if (count !== null && count >= 20) {
          console.error(`🚨 FRAUD DETECTED: High rate of failed payments today! (${count} failures in 24 hours)`);
          await supabaseAdmin.from("audit_logs").insert({
            event: "security_alert",
            user_id: userId,
            ip,
            metadata: {
              reason: "High rate of failed payments today",
              count_24_hours: count
            }
          });
        }
      } catch (fraudErr) {
        console.error("Fraud verification check failed inside payment.failed hook:", fraudErr);
      }

      await supabaseAdmin.from("webhook_events").update({ status: "completed", processed_at: new Date().toISOString() }).eq("event_id", eventId);

    } else if (eventType === "order.paid") {
      const orderEntity = payload.payload.order.entity;
      const orderId = orderEntity.id;
      const userId = orderEntity.notes?.user_id;

      // Update payment status to captured/paid if not already captured
      await supabaseAdmin
        .from("payments")
        .update({
          status: "captured",
          updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId)
        .neq("status", "captured"); // do not override captured

      await supabaseAdmin.from("audit_logs").insert({
        event: "order_paid",
        user_id: userId,
        ip,
        metadata: {
          order_id: orderId
        }
      });

      await supabaseAdmin.from("webhook_events").update({ status: "completed", processed_at: new Date().toISOString() }).eq("event_id", eventId);
    } else {
      // Unhandled events (e.g. refund, payout)
      await supabaseAdmin.from("webhook_events").update({ status: "completed", processed_at: new Date().toISOString() }).eq("event_id", eventId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`❌ Unexpected error processing webhook event ${eventId}:`, err.message);
    await supabaseAdmin.from("webhook_events").update({ status: "failed" }).eq("event_id", eventId);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
