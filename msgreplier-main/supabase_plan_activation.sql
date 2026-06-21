-- ============================================================
-- Plan Activation Helper RPC
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================
-- This function is called by the verify-payment API route to
-- immediately activate the user's plan upon payment verification,
-- without waiting for the Razorpay webhook.
-- The webhook (process_captured_payment) still runs as a backup
-- and is idempotent via the credit_transactions ledger guard.

CREATE OR REPLACE FUNCTION public.increment_credits_and_set_plan(
  p_user_id UUID,
  p_plan TEXT,
  p_credits_to_add INTEGER
)

RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    plan = p_plan,
    credits = COALESCE(credits, 0) + p_credits_to_add
  WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION public.increment_credits_and_set_plan(UUID, TEXT, INTEGER) TO service_role;
