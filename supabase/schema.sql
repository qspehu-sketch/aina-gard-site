-- Скопируйте весь файл в Supabase → SQL Editor → New query → Run
-- Один раз на проект.

-- ===== Таблицы =====

create table if not exists public.service_cards (
  slot int primary key check (slot between 1 and 4),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title_ru text not null default '',
  title_en text not null default '',
  body_ru text not null default '',
  body_en text not null default '',
  image_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default '',
  text_ru text not null default '',
  text_en text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'archived')),
  created_at timestamptz not null default now()
);

-- ===== RLS =====

alter table public.service_cards enable row level security;
alter table public.articles enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;

-- service_cards: все читают; пишут только авторизованные
drop policy if exists "service_cards_select_public" on public.service_cards;
create policy "service_cards_select_public"
  on public.service_cards for select using (true);

drop policy if exists "service_cards_write_auth" on public.service_cards;
create policy "service_cards_write_auth"
  on public.service_cards for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- articles: гости видят только опубликованные
drop policy if exists "articles_select_public" on public.articles;
create policy "articles_select_public"
  on public.articles for select
  using (published = true);

drop policy if exists "articles_all_auth" on public.articles;
create policy "articles_all_auth"
  on public.articles for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- reviews
drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public"
  on public.reviews for select
  using (published = true);

drop policy if exists "reviews_all_auth" on public.reviews;
create policy "reviews_all_auth"
  on public.reviews for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- leads: гость только создаёт; читать/менять — только вы (вход)
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
  on public.leads for insert
  with check (true);

drop policy if exists "leads_all_auth" on public.leads;
create policy "leads_all_auth"
  on public.leads for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ===== Хранилище картинок (статьи и т.п.) =====

insert into storage.buckets (id, name, public)
values ('site-uploads', 'site-uploads', true)
on conflict (id) do nothing;

drop policy if exists "site_uploads_read" on storage.objects;
create policy "site_uploads_read"
  on storage.objects for select
  using (bucket_id = 'site-uploads');

drop policy if exists "site_uploads_write_auth" on storage.objects;
create policy "site_uploads_write_auth"
  on storage.objects for insert
  with check (bucket_id = 'site-uploads' and auth.uid() is not null);

drop policy if exists "site_uploads_update_auth" on storage.objects;
create policy "site_uploads_update_auth"
  on storage.objects for update
  using (bucket_id = 'site-uploads' and auth.uid() is not null);

drop policy if exists "site_uploads_delete_auth" on storage.objects;
create policy "site_uploads_delete_auth"
  on storage.objects for delete
  using (bucket_id = 'site-uploads' and auth.uid() is not null);

-- ===== Стартовые данные для 4 карточек (как на сайте сейчас) =====

insert into public.service_cards (slot, data) values
(1, '{
  "ru": {"title":"Личный бренд","back_title":"Личный бренд","price":"от 5 000 ₽","tags":["Нейрофотосессии","Цифровой аватар","Нейровидео","Контент для соцсетей"]},
  "en": {"title":"Personal brand","back_title":"Personal brand","price":"from 5000 ₽","tags":["Neuro photo sessions","Digital avatar","Neuro video","Social content"]}
}'::jsonb),
(2, '{
  "ru": {"title":"Бизнес","back_title":"Бизнес","price":"от 10 000 ₽","tags":["Автоматизация процессов","AI-агенты и боты","Сайты и лендинги","Приложения под задачу"]},
  "en": {"title":"Business","back_title":"Business","price":"from 10 000 ₽","tags":["Process automation","AI agents & bots","Sites & landing pages","Apps for your goals"]}
}'::jsonb),
(3, '{
  "ru": {"title":"Творчество","back_title":"Творчество","price":"от 3 000 ₽","tags":["Нейродизайн","Изображения и видео","Песни и музыка","Креативные концепции"]},
  "en": {"title":"Creativity","back_title":"Creativity","price":"from 3000 ₽","tags":["Neuro design","Images & video","Songs & music","Creative concepts"]}
}'::jsonb),
(4, '{
  "ru": {"title":"Жизнь","back_title":"Жизнь","price":"от 3 000 ₽","tags":["AI для повседневных задач","Идеи и планирование","Личные проекты","Умные помощники"]},
  "en": {"title":"Life","back_title":"Life","price":"from 3000 ₽","tags":["AI for daily tasks","Ideas & planning","Personal projects","Smart assistants"]}
}'::jsonb)
on conflict (slot) do nothing;
