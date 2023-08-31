-- Migration number: 0001 	 2023-08-31T13:07:28.547Z

alter table "User" add column "createdAt" timestamp default CURRENT_TIMESTAMP not null;

alter table "User" add column "disabled" integer default 0 not null;

alter table "User" add column "admin" integer default 0 not null;

create table "AccessControl" ("id" integer not null primary key, "userId" text not null references "User" ("id") on delete cascade, "createdAt" timestamp default CURRENT_TIMESTAMP not null, "kind" integer not null, "key" text not null, "glob" text not null, "hasRead" integer default 0 not null, "hasWrite" integer default 0 not null);

create index "access_control_kind_key_idx" on "AccessControl" ("kind", "key");

