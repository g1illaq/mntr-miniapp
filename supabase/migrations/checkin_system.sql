-- Run this in Supabase → SQL Editor

-- Спринты (создаёт только администратор)
create table if not exists sprints (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  direction text,          -- 'M' | 'N' | 'T' | 'R' | null (все)
  daily_task text,         -- задание дня, показывается в чек-ине
  start_date date not null,
  end_date date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Ежедневные чек-ины участников
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null,
  sprint_id uuid references sprints(id) on delete set null,
  checkin_date date not null,
  energy int check (energy between 1 and 5),
  practice_done text default 'no',   -- 'yes' | 'partial' | 'no'
  note text,
  created_at timestamptz default now(),
  unique(user_id, checkin_date)
);

-- Изученные материалы
create table if not exists completed_materials (
  user_id bigint not null,
  post_id bigint not null,
  completed_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Индексы для быстрых запросов
create index if not exists checkins_user_date on checkins(user_id, checkin_date desc);
create index if not exists completed_user on completed_materials(user_id);

-- RLS: service role ключ в API обходит RLS, но включим для порядка
alter table sprints enable row level security;
alter table checkins enable row level security;
alter table completed_materials enable row level security;

create policy "public_read_sprints" on sprints for select using (true);
create policy "all_checkins" on checkins for all using (true);
create policy "all_completed" on completed_materials for all using (true);
