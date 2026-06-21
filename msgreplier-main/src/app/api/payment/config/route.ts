import { NextResponse } from "next/server";

// ─────────────────────────────────────────────
// GET /api/payment/config
// Returns only the public Razorpay KEY_ID.
// KEY_SECRET is NEVER sent to the client.
// ─────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    keyId: process.env.RAZORPAY_KEY_ID || "",
  });
}
