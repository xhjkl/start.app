--
-- Feed this to a fresh installment of Postgres
--

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table "user" (
  "user_id" uuid primary key not null default uuid_generate_v4()
);

create table "user_email" (
  "user_id" uuid not null references "user"("user_id"),
  "address" character varying(256) unique not null
);

create table "user_phone" (
  "user_id" uuid not null references "user"("user_id"),
  "phone_number" character varying(256) unique not null
);

create table "user_passcode" (
  "user_id" uuid not null references "user"("user_id"),
  "digest" bytea not null
);

create table "user_twitter" (
  "user_id" uuid not null references "user"("user_id"),
  "external_id" character varying(256) unique not null
);

create table "user_github" (
  "user_id" uuid not null references "user"("user_id"),
  "external_id" character varying(256) unique not null
);

create table "session" (
  "user_id" uuid null references "user"("user_id"),
  "token" character varying(48) primary key not null default uuid_generate_v4(),
  "timestamp" timestamp without time zone not null default now(),
  "associated_data" jsonb not null default '{}'::jsonb
);
create function "session_expire"() returns trigger language plpgsql as $$
begin
  delete from "session" where "timestamp" < now() - interval '1 week';
  return new;
end
$$;
create trigger "session_expire_trigger" after insert on "session" execute procedure "session_expire"();
create function "session_refresh"() returns trigger language plpgsql as $$
begin
  new."timestamp" := now();
  return new;
end
$$;
create trigger "session_refresh_trigger" before update on "session" for each row execute procedure "session_refresh"();
