drop table if exists public.packages;
create table public.packages(
  id text primary key,
  version text
);

insert into public.packages values ('postgraphile', '1.0.0');

drop function if exists public.packages_subscription() cascade;
create function public.packages_subscription() returns trigger as $$
declare
  v_record record;
begin
    v_record = case TG_OP
      when 'INSERT' then NEW
      when 'UPDATE' then NEW
      when 'DELETE' then OLD
    end;

    perform pg_notify('graphql:packages:' || v_record.id, json_build_object(
      'action', lower(TG_OP),
      'event', 'packageUpdate',
      'packageId', v_record.id
    )::text);
  return v_record;
end;
$$ language plpgsql volatile set search_path from current security definer;

create trigger _500_gql_update
  after insert or update or delete on public.packages
  for each row
  execute procedure public.packages_subscription();