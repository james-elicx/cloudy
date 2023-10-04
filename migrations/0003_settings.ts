import type { Kysely } from 'kysely';
import { sql } from 'kysely';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

export const up: MigrationFunction = async (db, addSql) => {
	addSql(
		db.schema
			.createTable('Settings')
			.addColumn('key', 'text', (c) => c.primaryKey().notNull())
			.addColumn('value', 'text', (c) => c.notNull())
			.addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
			.addColumn('updatedBy', 'text', (col) => col.references('User.id').notNull())
			.compile().sql,
	);
};

export const down: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.dropTable('Settings').compile().sql);
};
