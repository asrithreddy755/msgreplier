-- Create the reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null check (char_length(comment) <= 1000)
);

-- Enable Row Level Security (RLS)
alter table reviews enable row level security;

-- Create policies for public reviews submission and viewing
create policy "Allow public insert access to reviews"
  on reviews for insert
  with check (true);

create policy "Allow public read access to reviews"
  on reviews for select
  using (true);
