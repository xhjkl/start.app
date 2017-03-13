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

create table "authtoken" (
  "user_id" uuid not null references "user"("user_id"),
  "creation_timestamp" timestamp without time zone not null default now(),
  "token" uuid primary key not null default uuid_generate_v4()
);
create function "authtoken_expire"() returns trigger language plpgsql as $$
begin
  delete from "authtoken" where "creation_timestamp" < now() - interval '1 week';
  return new;
end
$$;
create trigger "authtoken_expire_trigger" after insert on "authtoken" execute procedure "authtoken_expire"();
