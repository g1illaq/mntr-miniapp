-- Посты из Telegram канала
create table if not exists posts (
  id bigserial primary key,
  message_id bigint unique not null,
  text text,
  caption text,
  photo_url text,
  hashtags text[] default '{}',
  views integer default 0,
  published_at timestamptz not null,
  created_at timestamptz default now()
);

-- Индексы для быстрого поиска
create index if not exists posts_published_at_idx on posts(published_at desc);
create index if not exists posts_hashtags_idx on posts using gin(hashtags);

-- Чек-ины участников
create table if not exists checkins (
  id bigserial primary key,
  user_id bigint not null,
  text text,
  mood integer,
  created_at timestamptz default now()
);

-- Разрешаем чтение постов всем
alter table posts enable row level security;
create policy "Posts are readable by everyone" on posts for select using (true);

alter table checkins enable row level security;
create policy "Users can insert their own checkins" on checkins for insert with check (true);
create policy "Users can read their own checkins" on checkins for select using (true);
