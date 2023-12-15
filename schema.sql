drop schema if exists case_mgmt cascade;
drop schema if exists app_public cascade;
drop schema if exists app_private cascade;
create schema case_mgmt;
create schema app_public;
create schema app_private;
create type case_mgmt.entity_type as enum ('PERSON', 'ORGANIZATION');

create table case_mgmt.entities (
  id uuid not null primary key,
  type case_mgmt.entity_type not null default 'PERSON'::case_mgmt.entity_type,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  website_url text
);

create table case_mgmt.people (
  id uuid primary key references case_mgmt.entities(id),
  first_name text not null,
  middle_name text,
  last_name text,
  suffix text
);

create table case_mgmt.organizations(
  id uuid primary key references case_mgmt.entities(id),
  legal_name text not null,
  short_name text
);

comment on table case_mgmt.entities is $$
  @interface mode:relational type:type
  @type PERSON references:people 
  @type ORGANIZATION references:organizations
$$;
