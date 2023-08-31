-- Migration number: 0002 	 2023-08-31T13:07:28.549Z

create unique index "access_control_userid_kind_key_glob_unique" on "AccessControl" ("userId", "kind", "key", "glob");

create table "Visibility" ("id" integer not null primary key, "createdAt" timestamp default CURRENT_TIMESTAMP not null, "kind" integer not null, "key" text not null, "glob" text default '*' not null, "public" integer default 0 not null, "readOnly" integer default 1 not null);

create unique index "visibility_kind_key_glob_unique" on "Visibility" ("kind", "key", "glob");

