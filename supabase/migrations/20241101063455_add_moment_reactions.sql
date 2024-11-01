create type moment_reaction_type as enum ('thumbs_up', 'thumbs_down');

create table moment_reactions (
  id uuid primary key default gen_random_uuid(),
  moment_id text not null references moments(id),
  user_id uuid not null references profiles(id),
  reaction_type moment_reaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one reaction per user per moment
  unique(moment_id, user_id)
);

create table moment_comments (
  id uuid primary key default gen_random_uuid(),
  moment_id text not null references moments(id),
  user_id uuid not null references profiles(id),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better query performance
create index moment_reactions_moment_id_idx on moment_reactions(moment_id);
create index moment_reactions_user_id_idx on moment_reactions(user_id);
create index moment_comments_moment_id_idx on moment_comments(moment_id);
create index moment_comments_user_id_idx on moment_comments(user_id);

-- Add trigger to update updated_at on comments
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_moment_comments_updated_at
  before update on moment_comments
  for each row
  execute function update_updated_at_column();
