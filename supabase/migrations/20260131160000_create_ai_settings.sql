-- Create table for AI Settings
create table if not exists ai_settings (
    id uuid default gen_random_uuid() primary key,
    provider text not null check (provider in ('openrouter', 'gemini', 'openai')),
    api_key text not null,
    model text,
    models text[],
    is_active boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: We only want one active setting at a time, but we'll enforce that via application logic or a trigger. 
-- For simplicity, we'll handle it in the application (upsert/reset).

-- RLS Policies
alter table ai_settings enable row level security;

-- Allow read access to authenticated users (so the app can use the config)
create policy "Allow read access to authenticated users"
    on ai_settings for select
    to authenticated
    using (true);

-- Allow write access only to admins
create policy "Allow write access to admins"
    on ai_settings for all
    to authenticated
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'admin'
        )
    );

-- Add some comments
comment on table ai_settings is 'Stores global AI configuration for the system.';
comment on column ai_settings.provider is 'The AI provider: openrouter, gemini, or openai.';
comment on column ai_settings.is_active is 'Flag to determine which configuration is currently in use.';
