-- Allow editors to prioritize public content without duplicating records.
alter table posts
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_order integer not null default 0;

alter table gallery
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_order integer not null default 0;

alter table posts
  drop constraint if exists posts_featured_order_check,
  add constraint posts_featured_order_check check (featured_order >= 0);

alter table gallery
  drop constraint if exists gallery_featured_order_check,
  add constraint gallery_featured_order_check check (featured_order >= 0);

drop index if exists posts_featured_idx;
create index posts_featured_idx
  on posts(post_type, published, is_featured, featured_order, created_at desc);

drop index if exists gallery_featured_idx;
create index gallery_featured_idx
  on gallery(is_featured, featured_order, created_at desc);
