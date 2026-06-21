-- ============================================================
-- Production-Grade Payment Schema & Credit Ledger Migration
-- ============================================================

-- 1. Update Profiles Table with credits constraint
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 6;

-- Ensure constraint is created idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_credits_positive'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT check_credits_positive CHECK (credits >= 0);
  END IF;
END;
$$;

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id    TEXT UNIQUE NOT NULL,
  payment_id  TEXT UNIQUE,
  amount      INTEGER NOT NULL, -- in paise
  plan        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'created', -- 'created', 'verified', 'captured', 'failed'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index order_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- 3. Create Credit Ledger Table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL, -- positive for credits added, negative for deductions
  source        TEXT NOT NULL, -- 'payment', 'signup', 'create_wish', etc.
  payment_id    TEXT UNIQUE, -- references payments(payment_id)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- 4. Create Webhook Events Storage (Retry Safety)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      TEXT UNIQUE NOT NULL, -- Razorpay Event ID (evt_...)
  event_type    TEXT NOT NULL,
  payload       JSONB NOT NULL,
  received_at   TIMESTAMPTZ DEFAULT NOW(),
  processed_at  TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'received' -- 'received', 'processing', 'completed', 'failed'
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);

-- 5. Create Audit Logs Table (Admin Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event       TEXT NOT NULL, -- 'payment_created', 'payment_verified', 'payment_failed', 'webhook_received', 'signature_failed', 'credits_added'
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip          TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Define RLS Policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "No direct webhook event access" ON public.webhook_events;
CREATE POLICY "No direct webhook event access"
  ON public.webhook_events FOR ALL
  USING (false);

DROP POLICY IF EXISTS "No direct audit log access" ON public.audit_logs;
CREATE POLICY "No direct audit log access"
  ON public.audit_logs FOR ALL
  USING (false);

-- 8. Create Atomic DB Transaction Function for Webhook Credit Allocation
CREATE OR REPLACE FUNCTION public.process_captured_payment(
  p_event_id TEXT,
  p_user_id UUID,
  p_order_id TEXT,
  p_payment_id TEXT,
  p_amount INTEGER,
  p_plan TEXT,
  p_credits_to_add INTEGER,
  p_ip TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_webhook_completed BOOLEAN;
  v_already_credited BOOLEAN;
  v_payment_matches BOOLEAN;
BEGIN
  -- 1. Check if the webhook event was already completed
  SELECT EXISTS (
    SELECT 1 FROM public.webhook_events WHERE event_id = p_event_id AND status = 'completed'
  ) INTO v_webhook_completed;

  IF v_webhook_completed THEN
    RETURN FALSE;
  END IF;

  -- 2. Check if this payment_id already granted credits (Idempotency ledger guard)
  SELECT EXISTS (
    SELECT 1 FROM public.credit_transactions WHERE payment_id = p_payment_id
  ) INTO v_already_credited;

  IF v_already_credited THEN
    -- If already credited, simply mark event completed and return
    UPDATE public.webhook_events
    SET status = 'completed', processed_at = NOW()
    WHERE event_id = p_event_id;
    RETURN FALSE;
  END IF;

  -- 3. Verify Razorpay Order Ownership matches local DB records (Verify payments.order_id == webhook.order_id AND payments.user_id == notes.user_id)
  SELECT EXISTS (
    SELECT 1 FROM public.payments WHERE order_id = p_order_id AND user_id = p_user_id
  ) INTO v_payment_matches;

  IF NOT v_payment_matches THEN
    -- Log failure to audit logs and raise exception to roll back the webhook status update
    INSERT INTO public.audit_logs (event, user_id, ip, metadata, created_at)
    VALUES (
      'payment_failed',
      p_user_id,
      p_ip,
      jsonb_build_object(
        'reason', 'Order ownership verification failed. Order does not match user in payments table.',
        'order_id', p_order_id,
        'payment_id', p_payment_id
      ),
      NOW()
    );
    
    UPDATE public.webhook_events
    SET status = 'failed', processed_at = NOW()
    WHERE event_id = p_event_id;
    
    RETURN FALSE;
  END IF;

  -- 4. Update the payment record status to captured
  INSERT INTO public.payments (user_id, order_id, payment_id, amount, plan, status, created_at, updated_at)
  VALUES (p_user_id, p_order_id, p_payment_id, p_amount, p_plan, 'captured', NOW(), NOW())
  ON CONFLICT (order_id)
  DO UPDATE SET
    payment_id = EXCLUDED.payment_id,
    status = 'captured',
    updated_at = NOW();

  -- 5. Record the Credit Transaction ledger entry
  INSERT INTO public.credit_transactions (user_id, amount, source, payment_id, created_at)
  VALUES (p_user_id, p_credits_to_add, 'payment', p_payment_id, NOW());

  -- 6. Atomically update the user's credits balance and active plan
  UPDATE public.profiles
  SET
    credits = COALESCE(credits, 0) + p_credits_to_add,
    plan = p_plan
  WHERE id = p_user_id;

  -- 7. Write an Audit Log entry for the credit assignment
  INSERT INTO public.audit_logs (event, user_id, ip, metadata, created_at)
  VALUES (
    'credits_added',
    p_user_id,
    p_ip,
    jsonb_build_object(
      'payment_id', p_payment_id,
      'order_id', p_order_id,
      'credits_added', p_credits_to_add,
      'plan', p_plan
    ),
    NOW()
  );

  -- 8. Mark the webhook event as completed
  UPDATE public.webhook_events
  SET status = 'completed', processed_at = NOW()
  WHERE event_id = p_event_id;

  RETURN TRUE;
END;
$$;
