-- Create the love_greetings table
create table if not exists love_greetings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  recipient_name text not null,
  sender_name text not null,
  relationship text not null,
  occasion text not null,
  message text not null,
  theme text default 'hearts',
  sender_avatar text default '💌',
  photo_url text,
  music_id text default 'none',
  reveal_type text default 'envelope',
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);



-- Enable RLS
alter table love_greetings enable row level security;

-- Create policies
create policy "Allow public read access to greetings by slug"
  on love_greetings for select
  using (true);

create policy "Allow public insert access to greetings"
  on love_greetings for insert
  with check (true);
