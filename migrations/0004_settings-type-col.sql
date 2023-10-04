-- Migration number: 0004 	 2023-10-04T21:01:19.012Z

alter table "Settings" add column "type" text not null;

