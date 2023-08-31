/* eslint-disable no-console */
import { existsSync, writeFileSync, mkdirSync, readdirSync, rmSync, appendFileSync } from 'fs';
import { join, resolve } from 'path';
import { Kysely } from 'kysely';
import { D1Dialect } from './kysely-d1';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

type MigrationExports = {
	up: MigrationFunction;
	down: MigrationFunction;
};

const template = `import type { Kysely } from 'kysely';
// import { sql } from 'kysely';

type MigrationFunction = (
	db: Kysely<unknown>,
	addSql: (rawSql: string) => void,
) => Promise<void> | void;

export const up: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.compile().sql);
};

export const down: MigrationFunction = async (db, addSql) => {
	addSql(db.schema.compile().sql);
};
`;

const migrationsDir = resolve('./migrations');

const getLastMigration = () => {
	const files = readdirSync(migrationsDir).filter((file) => file.endsWith('.ts'));

	if (files.length === 0) {
		return null;
	}
	const lastMigration = files
		.map((file) => file.replace(/_.+$/, ''))
		.sort()
		.pop();

	const lastMigrationNumber = Number(lastMigration);
	if (Number.isNaN(lastMigrationNumber)) {
		throw new Error(`Invalid migration number: ${lastMigration}`);
	} else {
		return lastMigrationNumber;
	}
};

const createMigration = (name?: string) => {
	if (!name) {
		console.error('Please provide a name for the migration.');
		return;
	}

	const lastMigration = getLastMigration() || -1;
	const fileName = `${`${lastMigration + 1}`.padStart(4, '0')}_${name}.ts`;
	const filePath = join(migrationsDir, fileName);

	if (existsSync(filePath)) {
		console.error(`Migration ${fileName} already exists.`);
		return;
	}

	writeFileSync(filePath, template);
	console.log(`Created migration ${fileName}.`);
	console.log(filePath);
};

const compileMigrations = async () => {
	if (!existsSync(migrationsDir)) mkdirSync(migrationsDir);

	const files = readdirSync(migrationsDir).filter((file) => file.endsWith('.ts'));

	for (const file of files) {
		const migrationNumber = file.replace(/_.+$/, '');
		const migrationFileName = file.replace('.ts', '.sql');
		const migrationFilePath = join(migrationsDir, migrationFileName);

		if (existsSync(migrationFilePath)) {
			console.log(`Migration already exists: ${migrationFileName}`);
			continue;
		}

		const tsFilePath = join(migrationsDir, file);
		const migration = await import(tsFilePath);
		const { up } = migration as MigrationExports;

		rmSync(migrationFilePath, { force: true });

		const db = new Kysely({ dialect: new D1Dialect({ database: {} as D1Database }) });
		const addSql = (rawSql: string) => {
			const trimmed = rawSql.trim();
			const withSemiColon =
				!trimmed.startsWith('--') && !trimmed.endsWith(';') ? `${trimmed};` : trimmed;
			appendFileSync(migrationFilePath, `${withSemiColon}\n\n`);
		};

		addSql(`-- Migration number: ${migrationNumber} 	 ${new Date().toISOString()}`);

		try {
			await Promise.resolve(up(db, addSql));
			console.log('Compiled migration:', migrationFileName);
		} catch (err) {
			console.error(`Error compiling migration ${migrationFileName}:`, err);
			rmSync(migrationFilePath, { force: true });
		}
	}
};

switch (process.argv[2]) {
	case 'create': {
		if (!process.argv[3]) {
			console.error('Please provide a name for the migration.');
		} else {
			createMigration(process.argv[3]);
		}
		break;
	}
	case 'compile': {
		compileMigrations();
		break;
	}
	default: {
		console.error('No command provided. Use `create <name>` or `compile`.');
		break;
	}
}
