do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'invites'
      and column_name = 'attempts'
  ) then
    alter table public.invites
      add column attempts int not null default 0;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_name = 'invites'
      and column_name = 'last_error'
  ) then
    alter table public.invites
      add column last_error text;
  end if;
end $$;
