-- ============================================================
-- Love Rapid Sessions — Supabase Migration
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS love_rapid_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code        text        UNIQUE NOT NULL,
  status           text        NOT NULL DEFAULT 'waiting',
  -- status values: 'waiting' | 'in_progress' | 'revealing'

  partner_a_name   text        NOT NULL,
  partner_b_name   text,

  questions        jsonb       NOT NULL,   -- string[5] — chosen at create time
  answers_a        jsonb,                  -- string[5] — Partner A's answers
  answers_b        jsonb,                  -- string[5] — Partner B's answers

  a_submitted      boolean     NOT NULL DEFAULT false,
  b_submitted      boolean     NOT NULL DEFAULT false,

  -- Play-again linkage: set when one partner starts a rematch
  next_session_id  uuid,
  next_room_code   text,

  expires_at       timestamptz NOT NULL DEFAULT NOW() + INTERVAL '2 hours',
  created_at       timestamptz NOT NULL DEFAULT NOW()
);

-- 2. Row-Level Security (open policies — UUIDs are effectively unguessable)
ALTER TABLE love_rapid_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "love_rapid_public_select"
  ON love_rapid_sessions FOR SELECT USING (true);

CREATE POLICY "love_rapid_public_insert"
  ON love_rapid_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "love_rapid_public_update"
  ON love_rapid_sessions FOR UPDATE USING (true);

-- 3. Enable Realtime on this table
--    (Supabase Dashboard → Database → Replication can also be used)
ALTER PUBLICATION supabase_realtime ADD TABLE love_rapid_sessions;

-- 4. pg_cron cleanup job — runs every 30 minutes, hard-deletes expired rows
--    Requires the pg_cron extension (Database → Extensions → pg_cron)
SELECT cron.schedule(
  'cleanup-love-rapid-sessions',
  '*/30 * * * *',
  $$DELETE FROM love_rapid_sessions WHERE expires_at < NOW();$$
);
