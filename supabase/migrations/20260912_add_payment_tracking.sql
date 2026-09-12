alter table public.profiles
  add column if not exists payment_verified boolean not null default false,
  add column if not exists last_payment_date timestamptz;
