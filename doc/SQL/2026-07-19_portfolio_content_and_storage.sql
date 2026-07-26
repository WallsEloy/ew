-- Aplicado y verificado en Supabase el 2026-07-19.

insert into storage.buckets (id, name, public, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do nothing;

create table if not exists public.portfolio_collections (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('diseno', 'galeria')),
  slug text not null,
  name text not null,
  logo_path text,
  avatar_path text,
  bio text not null default '',
  position integer not null default 0,
  published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section, slug)
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.portfolio_collections(id) on delete cascade,
  legacy_id integer,
  slug text not null,
  title text not null,
  caption text not null default '',
  cover_path text,
  position integer not null default 0,
  published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, slug)
);

create table if not exists public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  alt_text text not null default '',
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, storage_path)
);

create table if not exists public.portfolio_highlights (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.portfolio_collections(id) on delete cascade,
  title text not null,
  image_path text,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_collections_section_position_idx
  on public.portfolio_collections (section, position);
create index if not exists portfolio_projects_collection_position_idx
  on public.portfolio_projects (collection_id, position);
create index if not exists portfolio_media_project_position_idx
  on public.portfolio_media (project_id, position);
create index if not exists portfolio_highlights_collection_position_idx
  on public.portfolio_highlights (collection_id, position);

alter table public.portfolio_collections enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_media enable row level security;
alter table public.portfolio_highlights enable row level security;

create policy "Public can read published portfolio collections"
  on public.portfolio_collections for select
  using (published = true);

create policy "Public can read published portfolio projects"
  on public.portfolio_projects for select
  using (
    published = true
    and exists (
      select 1 from public.portfolio_collections collection
      where collection.id = portfolio_projects.collection_id
        and collection.published = true
    )
  );

create policy "Public can read media from published projects"
  on public.portfolio_media for select
  using (
    exists (
      select 1
      from public.portfolio_projects project
      join public.portfolio_collections collection
        on collection.id = project.collection_id
      where project.id = portfolio_media.project_id
        and project.published = true
        and collection.published = true
    )
  );

create policy "Public can read published portfolio highlights"
  on public.portfolio_highlights for select
  using (
    published = true
    and exists (
      select 1 from public.portfolio_collections collection
      where collection.id = portfolio_highlights.collection_id
        and collection.published = true
    )
  );
