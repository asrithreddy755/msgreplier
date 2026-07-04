-- Create the api_keys table for dynamic rate limiting
create table if not exists api_keys (
  key text primary key,
  plan text not null default 'free',
  rate_limit integer not null, -- Maximum requests allowed
  window_ms integer not null,  -- Sliding/fixed window duration in milliseconds
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table api_keys enable row level security;

-- Create policy to allow the service role (backend) to perform operations
create policy "Allow service role full access"
  on api_keys for all
  using (true)
  with check (true);

-- Seed mock api keys for testing and development
insert into api_keys (key, plan, rate_limit, window_ms)
values
  ('key_free', 'free', 5, 60000),         -- 5 requests per minute
  ('key_pro', 'pro', 100, 60000),         -- 100 requests per minute
  ('key_enterprise', 'enterprise', 1000, 60000) -- 1000 requests per minute
on conflict (key) do update set
  plan = excluded.plan,
  rate_limit = excluded.rate_limit,
  window_ms = excluded.window_ms;
