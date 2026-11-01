create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_username text,
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin', 'driver')),
  address text,
  phone text,
  is_available boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users
  add column if not exists display_username text,
  add column if not exists is_available boolean not null default false;

alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('user', 'admin', 'driver'));

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
revoke update (username) on table public.users from authenticated;
grant update (display_username, name, address, phone) on table public.users to authenticated;

drop policy if exists "Users can read their own profile" on public.users;
create policy "Users can read their own profile"
  on public.users for select
  to authenticated
  using (
    (select auth.uid()) = id
    or lower(username) = lower((select auth.jwt() ->> 'email'))
  );

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (
    (select auth.uid()) = id
    or lower(username) = lower((select auth.jwt() ->> 'email'))
  )
  with check (
    (select auth.uid()) = id
    or lower(username) = lower((select auth.jwt() ->> 'email'))
  );

create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, username, name, role)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_user_profile();

-- Copy any legacy profile data to the Auth ID, including an admin role when
-- the auth trigger already created a default "user" profile for that account.
insert into public.users as current_profile (id, username, name, role, address, phone)
select
  auth_user.id,
  lower(coalesce(auth_user.email, legacy.username)),
  coalesce(
    nullif(legacy.name, ''),
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(auth_user.email, ''), '@', 1)
  ),
  legacy.role,
  legacy.address,
  legacy.phone
from auth.users as auth_user
cross join lateral (
  select profile.*
  from public.users as profile
  where lower(profile.username) = lower(auth_user.email)
  order by (profile.role = 'admin') desc, (profile.id = auth_user.id) desc
  limit 1
) as legacy
on conflict (id) do update
set
  username = coalesce(nullif(current_profile.username, ''), excluded.username),
  name = coalesce(nullif(current_profile.name, ''), excluded.name),
  role = case
    when current_profile.role = 'admin' or excluded.role = 'admin' then 'admin'
    when current_profile.role = 'driver' or excluded.role = 'driver' then 'driver'
    else current_profile.role
  end,
  address = coalesce(current_profile.address, excluded.address),
  phone = coalesce(current_profile.phone, excluded.phone);

-- Create profiles for Supabase Auth users that still have no profile row.
insert into public.users (id, username, name, role)
select
  auth_user.id,
  lower(coalesce(auth_user.email, '')),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(auth_user.email, ''), '@', 1)
  ),
  'user'
from auth.users as auth_user
where not exists (
  select 1
  from public.users as profile
  where profile.id = auth_user.id
)
on conflict (id) do nothing;

-- Remove duplicate legacy rows only after their data has been copied above.
delete from public.users as legacy
using auth.users as auth_user
where lower(legacy.username) = lower(auth_user.email)
  and legacy.id <> auth_user.id
  and exists (
    select 1
    from public.users as current_profile
    where current_profile.id = auth_user.id
  );

-- After creating the intended administrator account, promote it from the SQL Editor:
-- update public.users set role = 'admin' where lower(username) = lower('admin@example.com');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.set_driver_availability(p_is_available boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set is_available = p_is_available
  where id = (select auth.uid())
    and role = 'driver';

  if not found then
    raise exception 'Only delivery drivers can update their availability';
  end if;
end;
$$;

revoke all on function public.set_driver_availability(boolean) from public, anon;
grant execute on function public.set_driver_availability(boolean) to authenticated;

drop policy if exists "Admins can read delivery driver profiles" on public.users;
create policy "Admins can read delivery driver profiles"
  on public.users for select
  to authenticated
  using (role = 'driver' and (select public.is_admin()));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  ),
  customer_id uuid not null references auth.users (id) on delete cascade,
  assigned_driver_id uuid references auth.users (id) on delete set null,
  title text not null,
  items jsonb not null,
  price numeric(12, 2) not null check (price >= 0),
  status text not null default 'Processing'
    check (status in ('Processing', 'Shipped', 'Completed')),
  delivery_latitude double precision not null
    check (delivery_latitude between -90 and 90),
  delivery_longitude double precision not null
    check (delivery_longitude between -180 and 180),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
grant select on table public.orders to authenticated;
grant insert (customer_id, title, items, price, delivery_latitude, delivery_longitude)
  on table public.orders to authenticated;

drop policy if exists "Customers drivers and admins can read orders" on public.orders;
create policy "Customers drivers and admins can read orders"
  on public.orders for select
  to authenticated
  using (
    customer_id = (select auth.uid())
    or assigned_driver_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "Customers can create their own orders" on public.orders;
create policy "Customers can create their own orders"
  on public.orders for insert
  to authenticated
  with check (
    customer_id = (select auth.uid())
    and assigned_driver_id is null
    and status = 'Processing'
  );

create table if not exists public.delivery_locations (
  order_id uuid primary key references public.orders (id) on delete cascade,
  driver_id uuid not null references auth.users (id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  heading double precision check (heading between 0 and 360),
  updated_at timestamptz not null default now()
);

alter table public.delivery_locations enable row level security;
revoke all on table public.delivery_locations from anon, authenticated;
grant select on table public.delivery_locations to authenticated;

drop policy if exists "Order participants can read delivery locations" on public.delivery_locations;
create policy "Order participants can read delivery locations"
  on public.delivery_locations for select
  to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.orders
      where orders.id = delivery_locations.order_id
        and (
          orders.customer_id = (select auth.uid())
          or orders.assigned_driver_id = (select auth.uid())
        )
    )
  );

create or replace function public.assign_delivery_driver(
  p_order_id uuid,
  p_driver_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;

  if not exists (
    select 1 from public.users
    where id = p_driver_id and role = 'driver'
  ) then
    raise exception 'The selected account is not a delivery driver';
  end if;

  update public.orders
  set assigned_driver_id = p_driver_id
  where id = p_order_id
    and status <> 'Completed'
    and (payment_method = 'cod' or payment_status = 'paid');

  if not found then
    raise exception 'Order not found or already completed';
  end if;

  delete from public.delivery_locations
  where order_id = p_order_id
    and driver_id <> p_driver_id;
end;
$$;

create or replace function public.update_delivery_location(
  p_order_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_heading double precision default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.orders
    where id = p_order_id
      and assigned_driver_id = (select auth.uid())
      and status = 'Shipped'
  ) then
    raise exception 'This delivery is not assigned to you or is not out for delivery';
  end if;

  insert into public.delivery_locations (
    order_id, driver_id, latitude, longitude, heading, updated_at
  )
  values (
    p_order_id, (select auth.uid()), p_latitude, p_longitude, p_heading, now()
  )
  on conflict (order_id) do update
  set
    driver_id = excluded.driver_id,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    heading = excluded.heading,
    updated_at = now();
end;
$$;

create or replace function public.update_delivery_status(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status is null or p_status not in ('Shipped', 'Completed') then
    raise exception 'Invalid delivery status';
  end if;

  if p_status = 'Shipped' then
    update public.orders
    set status = p_status
    where id = p_order_id
      and assigned_driver_id = (select auth.uid())
      and status = 'Processing';
  else
    update public.orders
    set status = p_status
    where id = p_order_id
      and assigned_driver_id = (select auth.uid())
      and status = 'Shipped';
  end if;

  if not found then
    raise exception 'This delivery is not assigned to you or cannot transition to that status';
  end if;
end;
$$;

revoke all on function public.assign_delivery_driver(uuid, uuid) from public, anon;
revoke all on function public.update_delivery_location(uuid, double precision, double precision, double precision) from public, anon;
revoke all on function public.update_delivery_status(uuid, text) from public, anon;
grant execute on function public.assign_delivery_driver(uuid, uuid) to authenticated;
grant execute on function public.update_delivery_location(uuid, double precision, double precision, double precision) to authenticated;
grant execute on function public.update_delivery_status(uuid, text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'delivery_locations'
  ) then
    alter publication supabase_realtime add table public.delivery_locations;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'users'
  ) then
    alter publication supabase_realtime add table public.users;
  end if;
end;
$$;

-- Promote each delivery account after it has signed up:
-- update public.users set role = 'driver' where lower(username) = lower('driver@example.com');

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role in ('admin', 'driver')
  );
$$;

revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

drop policy if exists "Admins can read user profiles" on public.users;
create policy "Admins can read user profiles"
  on public.users for select
  to authenticated
  using ((select public.is_admin()));

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('pet', 'product')),
  category text not null,
  name text not null,
  breed text,
  age text,
  gender text,
  location text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  description text not null default '',
  image_url text not null default '',
  weight text,
  height text,
  health text,
  traits text[] not null default '{}',
  variations jsonb not null default '[]'::jsonb check (jsonb_typeof(variations) = 'array'),
  available boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_items enable row level security;
revoke all on table public.catalog_items from anon, authenticated;
grant select on table public.catalog_items to anon, authenticated;
grant insert (type, category, name, breed, age, gender, location, price, description, image_url, weight, height, health, traits, variations, created_by)
  on table public.catalog_items to authenticated;
grant update (type, category, name, breed, age, gender, location, price, description, image_url, weight, height, health, traits, variations, available)
  on table public.catalog_items to authenticated;
grant delete on table public.catalog_items to authenticated;

drop policy if exists "Users can read available catalog items" on public.catalog_items;
create policy "Users can read available catalog items"
  on public.catalog_items for select
  to authenticated
  using (available or (select public.is_admin()));

drop policy if exists "Public can read available catalog items" on public.catalog_items;
create policy "Public can read available catalog items"
  on public.catalog_items for select
  to anon
  using (available);

drop policy if exists "Admins can create catalog items" on public.catalog_items;
create policy "Admins can create catalog items"
  on public.catalog_items for insert
  to authenticated
  with check ((select public.is_admin()) and created_by = (select auth.uid()));

drop policy if exists "Admins can update catalog items" on public.catalog_items;
create policy "Admins can update catalog items"
  on public.catalog_items for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete catalog items" on public.catalog_items;
create policy "Admins can delete catalog items"
  on public.catalog_items for delete
  to authenticated
  using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-images', 'catalog-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = true, file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Catalog images are publicly readable" on storage.objects;
create policy "Catalog images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'catalog-images');

drop policy if exists "Admins can upload catalog images" on storage.objects;
create policy "Admins can upload catalog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'catalog-images' and (select public.is_admin()));

drop policy if exists "Admins can update catalog images" on storage.objects;
create policy "Admins can update catalog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'catalog-images' and (select public.is_admin()))
  with check (bucket_id = 'catalog-images' and (select public.is_admin()));

drop policy if exists "Admins can delete catalog images" on storage.objects;
create policy "Admins can delete catalog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'catalog-images' and (select public.is_admin()));

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, catalog_item_id)
);

alter table public.favorites enable row level security;
revoke all on table public.favorites from anon, authenticated;
grant select, insert, delete on table public.favorites to authenticated;

drop policy if exists "Users can manage their own favorites" on public.favorites;
create policy "Users can manage their own favorites"
  on public.favorites for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create table if not exists public.cart_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items (id) on delete cascade,
  variant text not null default 'Standard',
  quantity integer not null check (quantity between 1 and 99),
  selected boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, catalog_item_id, variant)
);

alter table public.cart_items enable row level security;
revoke all on table public.cart_items from anon, authenticated;
grant select on table public.cart_items to authenticated;

drop policy if exists "Users can read their own cart" on public.cart_items;
create policy "Users can read their own cart"
  on public.cart_items for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.save_my_cart(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry jsonb;
  item_id uuid;
  item_variant text;
  item_quantity integer;
  item_selected boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to save your cart';
  end if;
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) > 100 then
    raise exception 'Invalid cart data';
  end if;

  delete from public.cart_items where user_id = (select auth.uid());
  for entry in select value from jsonb_array_elements(p_items)
  loop
    item_id := (entry ->> 'catalog_item_id')::uuid;
    item_variant := coalesce(nullif(entry ->> 'variant', ''), 'Standard');
    item_quantity := (entry ->> 'quantity')::integer;
    item_selected := coalesce((entry ->> 'selected')::boolean, true);

    if item_quantity < 1 or item_quantity > 99 or not exists (
      select 1 from public.catalog_items
      where id = item_id and type = 'product' and available
    ) then
      raise exception 'Cart contains an unavailable item or invalid quantity';
    end if;

    insert into public.cart_items (
      user_id, catalog_item_id, variant, quantity, selected, updated_at
    )
    values (
      (select auth.uid()), item_id, item_variant, item_quantity,
      item_selected, now()
    )
    on conflict (user_id, catalog_item_id, variant) do update
    set quantity = excluded.quantity,
        selected = excluded.selected,
        updated_at = now();
  end loop;
end;
$$;

revoke all on function public.save_my_cart(jsonb) from public, anon;
grant execute on function public.save_my_cart(jsonb) to authenticated;

create table if not exists public.adoption_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references auth.users (id) on delete cascade,
  catalog_item_id uuid not null references public.catalog_items (id),
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  fulfillment text not null check (fulfillment in ('delivery', 'pickup')),
  notes text not null default '',
  status text not null default 'Pending'
    check (status in ('Pending', 'Approved', 'Rejected', 'Withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_pending_application_per_pet
  on public.adoption_applications (applicant_id, catalog_item_id)
  where status in ('Pending', 'Approved');

alter table public.adoption_applications enable row level security;
revoke all on table public.adoption_applications from anon, authenticated;
grant select on table public.adoption_applications to authenticated;
grant insert (applicant_id, catalog_item_id, full_name, phone, email, address, fulfillment, notes)
  on table public.adoption_applications to authenticated;

drop policy if exists "Applicants and admins can read applications" on public.adoption_applications;
create policy "Applicants and admins can read applications"
  on public.adoption_applications for select
  to authenticated
  using (applicant_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Users can submit applications for available pets" on public.adoption_applications;
create policy "Users can submit applications for available pets"
  on public.adoption_applications for insert
  to authenticated
  with check (
    applicant_id = (select auth.uid())
    and status = 'Pending'
    and exists (
      select 1 from public.catalog_items
      where id = catalog_item_id and type = 'pet' and available
    )
  );

create or replace function public.review_adoption_application(
  p_application_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  pet_id uuid;
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;
  if p_status is null or p_status not in ('Approved', 'Rejected') then
    raise exception 'Invalid application decision';
  end if;

  select catalog_item_id into pet_id
  from public.adoption_applications
  where id = p_application_id and status = 'Pending'
  for update;
  if not found then
    raise exception 'Application not found or already reviewed';
  end if;

  if p_status = 'Approved' then
    update public.catalog_items
    set available = false, updated_at = now()
    where id = pet_id and type = 'pet' and available;
    if not found then
      raise exception 'This pet is no longer available';
    end if;
  end if;

  update public.adoption_applications
  set status = p_status, updated_at = now()
  where id = p_application_id;
end;
$$;

revoke all on function public.review_adoption_application(uuid, text) from public, anon;
grant execute on function public.review_adoption_application(uuid, text) to authenticated;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.conversations enable row level security;
revoke all on table public.conversations from anon, authenticated;
grant select on table public.conversations to authenticated;

drop policy if exists "Conversation owners and admins can read conversations" on public.conversations;
create policy "Conversation owners and admins can read conversations"
  on public.conversations for select
  to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

create or replace function public.get_or_create_support_conversation()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  conversation_id uuid;
begin
  if (select auth.uid()) is null or (select public.is_admin()) then
    raise exception 'A customer account is required to start a support conversation';
  end if;

  insert into public.conversations (owner_id)
  values ((select auth.uid()))
  on conflict (owner_id) do update set owner_id = excluded.owner_id
  returning id into conversation_id;
  return conversation_id;
end;
$$;

revoke all on function public.get_or_create_support_conversation() from public, anon;
grant execute on function public.get_or_create_support_conversation() to authenticated;

create or replace function public.admin_get_or_create_support_conversation(p_owner_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  conversation_id uuid;
begin
  if not (select public.is_admin()) then
    raise exception 'Administrator access required';
  end if;
  if p_owner_id is null or not exists (
    select 1 from public.users
    where id = p_owner_id and role = 'user'
  ) then
    raise exception 'Choose a valid customer account';
  end if;

  insert into public.conversations (owner_id)
  values (p_owner_id)
  on conflict (owner_id) do update set owner_id = excluded.owner_id
  returning id into conversation_id;

  return conversation_id;
end;
$$;

revoke all on function public.admin_get_or_create_support_conversation(uuid) from public, anon;
grant execute on function public.admin_get_or_create_support_conversation(uuid) to authenticated;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  kind text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
revoke all on table public.notifications from anon, authenticated;
grant select on table public.notifications to authenticated;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.mark_notifications_read(p_notification_id uuid default null)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications
  set read_at = now()
  where user_id = (select auth.uid())
    and read_at is null
    and (p_notification_id is null or id = p_notification_id);
$$;

revoke all on function public.mark_notifications_read(uuid) from public, anon;
grant execute on function public.mark_notifications_read(uuid) to authenticated;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
revoke all on table public.messages from anon, authenticated;
grant select on table public.messages to authenticated;

drop policy if exists "Conversation participants can read messages" on public.messages;
create policy "Conversation participants can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (
          conversations.owner_id = (select auth.uid())
          or (select public.is_admin())
        )
    )
  );

create or replace function public.send_support_message(
  p_conversation_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  message_id uuid;
  conversation_owner uuid;
  clean_body text := btrim(p_body);
begin
  select owner_id into conversation_owner
  from public.conversations
  where id = p_conversation_id
    and (owner_id = (select auth.uid()) or (select public.is_admin()));

  if not found then
    raise exception 'Conversation not found or access denied';
  end if;
  if clean_body is null or length(clean_body) > 4000 then
    raise exception 'Message must contain 1 to 4000 characters';
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (p_conversation_id, (select auth.uid()), clean_body)
  returning id into message_id;

  update public.conversations set updated_at = now()
  where id = p_conversation_id;

  if (select auth.uid()) <> conversation_owner then
    insert into public.notifications (user_id, title, message, kind)
    values (conversation_owner, 'New support reply', left(clean_body, 240), 'message');
  end if;

  return message_id;
end;
$$;

revoke all on function public.send_support_message(uuid, text) from public, anon;
grant execute on function public.send_support_message(uuid, text) to authenticated;

create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, title, message, kind)
    values (new.customer_id, 'Order received', 'Your order ' || new.order_number || ' has been placed.', 'order');
  elsif new.status is distinct from old.status then
    insert into public.notifications (user_id, title, message, kind)
    values (
      new.customer_id,
      'Order status updated',
      'Your order ' || new.order_number || ' is now ' || new.status || '.',
      'order'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists orders_notify_customer on public.orders;
create trigger orders_notify_customer
  after insert or update of status on public.orders
  for each row execute function public.notify_order_status_change();

create or replace function public.notify_adoption_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, message, kind)
    values (
      new.applicant_id,
      'Adoption application updated',
      'Your application status is now ' || new.status || '.',
      'adoption'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists adoption_notify_applicant on public.adoption_applications;
create trigger adoption_notify_applicant
  after update of status on public.adoption_applications
  for each row execute function public.notify_adoption_status_change();

alter table public.orders
  add column if not exists payment_method text not null default 'cod',
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded')),
  add column if not exists delivery_address text not null default '',
  add column if not exists paymongo_checkout_session_id text,
  add column if not exists paymongo_checkout_url text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cod', 'paymongo_card', 'paymongo_gcash', 'paymongo_maya'));

create or replace function public.notify_payment_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.payment_status = 'paid' and old.payment_status is distinct from new.payment_status then
    insert into public.notifications (user_id, title, message, kind)
    values (
      new.customer_id,
      'Payment received',
      'Payment for order ' || new.order_number || ' has been confirmed.',
      'order'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists orders_notify_payment on public.orders;
create trigger orders_notify_payment
  after update of payment_status on public.orders
  for each row execute function public.notify_payment_status_change();

create or replace function public.create_store_order(
  p_items jsonb,
  p_delivery_latitude double precision,
  p_delivery_longitude double precision,
  p_delivery_address text,
  p_payment_method text
)
returns setof public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry jsonb;
  item_id uuid;
  item_variant text;
  item_quantity integer;
  item_price numeric(12, 2);
  product public.catalog_items%rowtype;
  order_items jsonb := '[]'::jsonb;
  subtotal numeric(12, 2) := 0;
  created_order public.orders%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in before placing an order';
  end if;
  if p_payment_method is null
    or p_payment_method not in ('cod', 'paymongo_card', 'paymongo_gcash', 'paymongo_maya') then
    raise exception 'Select a supported payment method';
  end if;
  if p_delivery_latitude is null or p_delivery_latitude not between -90 and 90
    or p_delivery_longitude is null or p_delivery_longitude not between -180 and 180 then
    raise exception 'A valid delivery location is required';
  end if;
  if length(btrim(coalesce(p_delivery_address, ''))) = 0 then
    raise exception 'A delivery address is required';
  end if;
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) = 0
    or jsonb_array_length(p_items) > 50 then
    raise exception 'Select between 1 and 50 items to order';
  end if;

  for entry in select value from jsonb_array_elements(p_items)
  loop
    item_id := (entry ->> 'catalog_item_id')::uuid;
    item_variant := coalesce(nullif(entry ->> 'variant', ''), 'Standard');
    item_quantity := (entry ->> 'quantity')::integer;
    if item_quantity is null or item_quantity < 1 or item_quantity > 99 then
      raise exception 'Invalid item quantity';
    end if;

    select * into product
    from public.catalog_items
    where id = item_id and type = 'product' and available;
    if not found then
      raise exception 'A selected product is no longer available';
    end if;

    if jsonb_array_length(product.variations) > 0 then
      select (variation_data ->> 'price')::numeric(12, 2) into item_price
      from jsonb_array_elements(product.variations) as variations(variation_data)
      where variation_data ->> 'size' = item_variant;
      if item_price is null then
        raise exception 'The selected product variation is unavailable';
      end if;
    else
      item_price := product.price;
    end if;

    subtotal := subtotal + item_price * item_quantity;
    order_items := order_items || jsonb_build_array(jsonb_build_object(
      'catalog_item_id', product.id,
      'title', product.name,
      'variant', item_variant,
      'quantity', item_quantity,
      'unit_price', item_price,
      'image_url', product.image_url
    ));
  end loop;

  insert into public.orders (
    customer_id, title, items, price, delivery_latitude, delivery_longitude,
    payment_method, payment_status, delivery_address
  )
  values (
    (select auth.uid()),
    order_items -> 0 ->> 'title',
    order_items,
    subtotal + 100,
    p_delivery_latitude,
    p_delivery_longitude,
    p_payment_method,
    'pending',
    btrim(p_delivery_address)
  )
  returning * into created_order;

  delete from public.cart_items
  where user_id = (select auth.uid())
    and selected
    and exists (
      select 1
      from jsonb_array_elements(p_items)
      where (value ->> 'catalog_item_id')::uuid = cart_items.catalog_item_id
        and coalesce(nullif(value ->> 'variant', ''), 'Standard') = cart_items.variant
    );

  return next created_order;
end;
$$;

revoke all on function public.create_store_order(jsonb, double precision, double precision, text, text) from public, anon;
grant execute on function public.create_store_order(jsonb, double precision, double precision, text, text) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['catalog_items', 'favorites', 'cart_items', 'adoption_applications', 'conversations', 'messages', 'notifications', 'orders']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
