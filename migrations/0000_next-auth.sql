-- Migration number: 0000 	 2023-08-31T13:07:28.542Z

create table "User" ("id" integer not null primary key, "name" text, "email" text not null unique, "emailVerified" timestamptz, "image" text);

create table "Account" ("id" integer not null primary key, "userId" integer not null references "User" ("id") on delete cascade, "type" text not null, "provider" text not null, "providerAccountId" text not null, "refresh_token" text, "access_token" text, "expires_at" bigint, "token_type" text, "scope" text, "id_token" text, "session_state" text);

create table "Session" ("id" integer not null primary key, "userId" integer not null references "User" ("id") on delete cascade, "sessionToken" text not null unique, "expires" timestamptz not null);

create table "VerificationToken" ("identifier" text not null, "token" text not null unique, "expires" timestamptz not null);

create index "Account_userId_index" on "Account" ("userId");

create index "Session_userId_index" on "Session" ("userId");

