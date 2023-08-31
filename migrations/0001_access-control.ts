import type { Kysely } from 'kysely';
import { sql } from 'kysely';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

export const up: MigrationFunction = async (db, addSql) => {
	addSql(
		db.schema
			.alterTable('User')
			.addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
			.compile().sql,
	);
	addSql(
		db.schema
			.alterTable('User')
			.addColumn('disabled', 'integer', (col) => col.defaultTo(0).notNull())
			.compile().sql,
	);
	addSql(
		db.schema
			.alterTable('User')
			.addColumn('admin', 'integer', (col) => col.defaultTo(0).notNull())
			.compile().sql,
	);

	addSql(
		db.schema
			.createTable('AccessControl')
			.addColumn('id', 'integer', (col) => col.primaryKey().notNull())
			.addColumn('userId', 'text', (col) => col.references('User.id').onDelete('cascade').notNull())
			.addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
			.addColumn('kind', 'integer', (col) => col.notNull())
			.addColumn('key', 'text', (col) => col.notNull())
			.addColumn('glob', 'text', (col) => col.notNull())
			.addColumn('hasRead', 'integer', (col) => col.notNull().defaultTo(0))
			.addColumn('hasWrite', 'integer', (col) => col.notNull().defaultTo(0))
			.compile().sql,
	);

	addSql(
		db.schema
			.createIndex('access_control_kind_key_idx')
			.on('AccessControl')
			.columns(['kind', 'key'])
			.compile().sql,
	);
};

export const down: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.alterTable('User').dropColumn('createdAt').compile().sql);
	addSql(db.schema.alterTable('User').dropColumn('disabled').compile().sql);
	addSql(db.schema.alterTable('User').dropColumn('admin').compile().sql);

	addSql(db.schema.dropTable('AccessControl').compile().sql);
};
