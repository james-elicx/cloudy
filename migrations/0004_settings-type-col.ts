import type { Kysely } from 'kysely';
// import { sql } from 'kysely';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

export const up: MigrationFunction = async (db, addSql) => {
	addSql(
		db.schema
			.alterTable('Settings')
			.addColumn('type', 'text', (c) => c.notNull())
			.compile().sql,
	);
};

export const down: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.alterTable('Settings').dropColumn('type').compile().sql);
};
