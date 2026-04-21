
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  skill_level text not null default 'intermediario' check (skill_level in ('iniciante','intermediario','avancado')),
  default_language text not null default 'typescript',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- WORKSPACES
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;
create policy "ws owner all" on public.workspaces for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  name text not null,
  description text,
  primary_language text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "projects owner all" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CONVERSATIONS
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null default 'Nova conversa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
create policy "conv owner all" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  language text,
  mode text check (mode in ('generate','explain','refactor','fix','chat')),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "msg owner all" on public.messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.messages(conversation_id, created_at);

-- SNIPPETS
create table public.code_snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  code text not null,
  language text not null default 'plaintext',
  tags text[] default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.code_snippets enable row level security;
create policy "snip owner all" on public.code_snippets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MEMORY
create table public.user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  category text not null default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.user_memory enable row level security;
create policy "mem owner all" on public.user_memory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PREFERENCES
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
create policy "prefs owner all" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FEEDBACK
create table public.message_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  vote text not null check (vote in ('up','down')),
  note text,
  created_at timestamptz not null default now()
);
alter table public.message_feedback enable row level security;
create policy "fb owner all" on public.message_feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_uat       before update on public.profiles      for each row execute function public.tg_set_updated_at();
create trigger projects_uat       before update on public.projects      for each row execute function public.tg_set_updated_at();
create trigger conversations_uat  before update on public.conversations for each row execute function public.tg_set_updated_at();
create trigger preferences_uat    before update on public.user_preferences for each row execute function public.tg_set_updated_at();

-- New user bootstrap
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ws_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));

  insert into public.workspaces (user_id, name, description)
  values (new.id, 'Pessoal', 'Workspace pessoal') returning id into ws_id;

  insert into public.user_preferences (user_id, prefs) values (new.id, '{}'::jsonb);
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
