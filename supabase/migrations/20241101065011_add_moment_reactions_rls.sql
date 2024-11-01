-- Enable RLS on the tables
alter table moment_reactions enable row level security;
alter table moment_comments enable row level security;

-- Policy for reading reactions: anyone can read reactions
create policy "Anyone can read reactions"
  on moment_reactions
  for select
  using (true);

-- Policy for creating/updating reactions: authenticated users can manage their own reactions
create policy "Users can manage their own reactions"
  on moment_reactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy for reading comments: anyone can read comments
create policy "Anyone can read comments"
  on moment_comments
  for select
  using (true);

-- Policy for creating comments: authenticated users can create comments
create policy "Users can create comments"
  on moment_comments
  for insert
  with check (auth.uid() = user_id);

-- Policy for updating comments: users can update their own comments
create policy "Users can update their own comments"
  on moment_comments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy for deleting comments: users can delete their own comments
create policy "Users can delete their own comments"
  on moment_comments
  for delete
  using (auth.uid() = user_id);
