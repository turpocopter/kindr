-- Run this SQL in Supabase SQL Editor.
-- It creates tables, constraints, RLS policies, and the storage bucket used by the app.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

alter table public.products
drop column if exists name;

create table if not exists public.product_reactions (
  id uuid primary key default gen_random_uuid(),
  source_product_id uuid not null references public.products(id) on delete cascade,
  target_product_id uuid not null references public.products(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (source_product_id, target_product_id),
  check (source_product_id <> target_product_id)
);

create index if not exists idx_products_owner_id on public.products(owner_id);
create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_reactions_source on public.product_reactions(source_product_id);
create index if not exists idx_reactions_target on public.product_reactions(target_product_id);

alter table public.products enable row level security;
alter table public.product_reactions enable row level security;

-- Products policies
create policy "products_select_authenticated"
on public.products
for select
to authenticated
using (true);

create policy "products_insert_own"
on public.products
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "products_update_own"
on public.products
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "products_delete_own"
on public.products
for delete
to authenticated
using (auth.uid() = owner_id);

-- Reactions policies
create policy "reactions_select_authenticated"
on public.product_reactions
for select
to authenticated
using (true);

create policy "reactions_insert_own_source"
on public.product_reactions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.products p
    where p.id = source_product_id
      and p.owner_id = auth.uid()
  )
);

create policy "reactions_update_own_source"
on public.product_reactions
for update
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = source_product_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = source_product_id
      and p.owner_id = auth.uid()
  )
);

create policy "reactions_delete_own_source"
on public.product_reactions
for delete
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = source_product_id
      and p.owner_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('toy-photos', 'toy-photos', true)
on conflict (id) do nothing;

create policy "toy_photos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'toy-photos');

create policy "toy_photos_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'toy-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "toy_photos_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'toy-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'toy-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "toy_photos_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'toy-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
