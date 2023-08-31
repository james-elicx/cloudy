import type { Kysely } from 'kysely';
import { sql } from 'kysely';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

export const up: MigrationFunction = async (db, addSql) => {
	addSql(
		db.schema
			.createIndex('access_control_userid_kind_key_glob_unique')
			.unique()
			.on('AccessControl')
			.columns(['userId', 'kind', 'key', 'glob'])
			.compile().sql,
	);

	addSql(
		db.schema
			.createTable('Visibility')
			.addColumn('id', 'integer', (c) => c.primaryKey().notNull())
			.addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
			.addColumn('kind', 'integer', (col) => col.notNull())
			.addColumn('key', 'text', (col) => col.notNull())
			.addColumn('glob', 'text', (col) => col.notNull().defaultTo('*'))
			.addColumn('public', 'integer', (col) => col.notNull().defaultTo(0))
			.addColumn('readOnly', 'integer', (col) => col.notNull().defaultTo(1))
			.compile().sql,
	);

	addSql(
		db.schema
			.createIndex('visibility_kind_key_glob_unique')
			.unique()
			.on('Visibility')
			.columns(['kind', 'key', 'glob'])
			.compile().sql,
	);
};

export const down: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.dropTable('Visibility').compile().sql);
};
