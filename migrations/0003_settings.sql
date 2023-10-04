-- Migration number: 0003 	 2023-10-04T20:54:53.882Z

create table "Settings" ("key" text not null primary key, "value" text not null, "updatedAt" timestamp default CURRENT_TIMESTAMP not null, "updatedBy" text not null references "User" ("id"));

