import type { Kysely } from 'kysely';
// import { sql } from 'kysely';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

// Schema is slightly modified from https://authjs.dev/reference/adapter/kysely#schema

export const up: MigrationFunction = async (db, addSql) => {
	addSql(
		db.schema
			.createTable('User')
			.addColumn('id', 'integer', (col) => col.primaryKey().notNull())
			.addColumn('name', 'text')
			.addColumn('email', 'text', (col) => col.unique().notNull())
			.addColumn('emailVerified', 'timestamptz')
			.addColumn('image', 'text')
			.compile().sql,
	);

	addSql(
		db.schema
			.createTable('Account')
			.addColumn('id', 'integer', (col) => col.primaryKey().notNull())
			.addColumn('userId', 'integer', (col) =>
				col.references('User.id').onDelete('cascade').notNull(),
			)
			.addColumn('type', 'text', (col) => col.notNull())
			.addColumn('provider', 'text', (col) => col.notNull())
			.addColumn('providerAccountId', 'text', (col) => col.notNull())
			.addColumn('refresh_token', 'text')
			.addColumn('access_token', 'text')
			.addColumn('expires_at', 'bigint')
			.addColumn('token_type', 'text')
			.addColumn('scope', 'text')
			.addColumn('id_token', 'text')
			.addColumn('session_state', 'text')
			.compile().sql,
	);

	addSql(
		db.schema
			.createTable('Session')
			.addColumn('id', 'integer', (col) => col.primaryKey().notNull())
			.addColumn('userId', 'integer', (col) =>
				col.references('User.id').onDelete('cascade').notNull(),
			)
			.addColumn('sessionToken', 'text', (col) => col.notNull().unique())
			.addColumn('expires', 'timestamptz', (col) => col.notNull())
			.compile().sql,
	);

	addSql(
		db.schema
			.createTable('VerificationToken')
			.addColumn('identifier', 'text', (col) => col.notNull())
			.addColumn('token', 'text', (col) => col.notNull().unique())
			.addColumn('expires', 'timestamptz', (col) => col.notNull())
			.compile().sql,
	);

	addSql(
		db.schema.createIndex('Account_userId_index').on('Account').column('userId').compile().sql,
	);

	addSql(
		db.schema.createIndex('Session_userId_index').on('Session').column('userId').compile().sql,
	);
};

export const down: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.dropTable('Account').ifExists().compile().sql);
	addSql(db.schema.dropTable('Session').ifExists().compile().sql);
	addSql(db.schema.dropTable('User').ifExists().compile().sql);
	addSql(db.schema.dropTable('VerificationToken').ifExists().compile().sql);
};
