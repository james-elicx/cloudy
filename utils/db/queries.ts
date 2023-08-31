import type { AccessControlKind } from '../cast';
import { castBoolToInt, castIntToBool, castIntToKind, castKindToInt } from '../cast';
import { db } from './schema';

type ReplaceValues<T, K extends keyof T, V> = Omit<T, K> & { [key in K]: V };

const castKeysToBool = <T extends { [key: string]: unknown }, K extends keyof T>(
	obj: T,
	keys: K[],
) => {
	for (const key of keys) {
		const oldVal = obj[key];
		if (typeof oldVal === 'number') {
			// eslint-disable-next-line no-param-reassign
			obj[key] = castIntToBool(oldVal) as T[K];
		}
	}
	return obj as ReplaceValues<T, K, boolean>;
};

export const getUserById = async (id: number) => {
	if (!db) return undefined;

	const resp = await db
		.selectFrom('User')
		.select(['id', 'createdAt', 'name', 'email', 'emailVerified', 'image', 'disabled', 'admin'])
		.where('id', '=', id)
		.executeTakeFirst();

	return resp ? castKeysToBool(resp, ['disabled']) : resp;
};

export const setUserIsAdmin = async (id: number, isAdmin: boolean) => {
	if (!db) return undefined;

	return db
		.updateTable('User')
		.set({ admin: castBoolToInt(isAdmin) })
		.where('id', '=', id)
		.execute();
};

const accessControlSelect = [
	'id',
	'userId',
	'createdAt',
	'kind',
	'key',
	'glob',
	'hasRead',
	'hasWrite',
] as const;

export const getUserAccessControl = async (userId: number, kind?: AccessControlKind) => {
	if (!db) return undefined;

	let q = db.selectFrom('AccessControl').select(accessControlSelect).where('userId', '=', userId);
	if (kind) q = q.where('kind', '=', castKindToInt(kind));
	const resp = await q.execute();

	return resp.map((item) => ({
		...castKeysToBool(item, ['hasRead', 'hasWrite']),
		kind: castIntToKind(item.kind),
	}));
};

export const getUserAccessControlForKey = async (
	userId: number,
	kind: AccessControlKind,
	key: string,
) => {
	if (!db) return undefined;

	const resp = await db
		.selectFrom('AccessControl')
		.select(accessControlSelect)
		.where('userId', '=', userId)
		.where('kind', '=', castKindToInt(kind))
		.where('key', '=', key)
		.executeTakeFirst();

	return resp
		? {
				...castKeysToBool(resp, ['hasRead', 'hasWrite']),
				kind: castIntToKind(resp.kind),
		  }
		: resp;
};

export const addAccessControlRecord = async (
	userId: number,
	opts: { kind: AccessControlKind; key: string; glob: string; hasRead: boolean; hasWrite: boolean },
) => {
	if (!db) return undefined;

	return db
		.insertInto('AccessControl')
		.values({
			userId,
			kind: castKindToInt(opts.kind),
			key: opts.key,
			glob: opts.glob,
			hasRead: castBoolToInt(opts.hasRead),
			hasWrite: castBoolToInt(opts.hasWrite),
		})
		.executeTakeFirst();
};

export const getVisibilityRecords = async ({
	kind,
	publicOnly,
	readOnly,
}: { kind?: AccessControlKind; publicOnly?: boolean; readOnly?: boolean } = {}) => {
	if (!db) return undefined;

	let q = db
		.selectFrom('Visibility')
		.select(['id', 'createdAt', 'kind', 'key', 'glob', 'public', 'readOnly']);
	if (kind) q = q.where('kind', '=', castKindToInt(kind));
	if (publicOnly) q = q.where('public', '=', castBoolToInt(true));
	if (readOnly !== undefined) q = q.where('readOnly', '=', castBoolToInt(readOnly));
	const resp = await q.execute();

	return resp.map((item) => ({
		...castKeysToBool(item, ['public', 'readOnly']),
		kind: castIntToKind(item.kind),
	}));
};

export type VisibilityRecord = NonNullable<
	Awaited<ReturnType<typeof getVisibilityRecords>>
>[number];

export const getVisibilityForKey = async (kind: AccessControlKind, key: string) => {
	if (!db) return undefined;

	const resp = await db
		.selectFrom('Visibility')
		.select(['id', 'createdAt', 'kind', 'key', 'glob', 'public', 'readOnly'])
		.where('kind', '=', castKindToInt(kind))
		.where('key', '=', key)
		.executeTakeFirst();

	return resp
		? {
				...castKeysToBool(resp, ['public', 'readOnly']),
				kind: castIntToKind(resp.kind),
		  }
		: resp;
};

export const updateVisibilityRecord = async (
	id: number | undefined,
	opts: {
		kind: AccessControlKind;
		key: string;
		glob: string;
		public: boolean;
		readOnly: boolean;
	},
) => {
	if (!db) return undefined;

	if (id) {
		return db
			.updateTable('Visibility')
			.set({
				glob: opts.glob,
				public: castBoolToInt(opts.public),
				readOnly: castBoolToInt(opts.readOnly),
			})
			.where('id', '=', id)
			.returning(['id'])
			.executeTakeFirst();
	}

	return db
		.insertInto('Visibility')
		.values({
			kind: castKindToInt(opts.kind),
			key: opts.key,
			glob: opts.glob,
			public: castBoolToInt(opts.public),
			readOnly: castBoolToInt(opts.readOnly),
		})
		.returning(['id'])
		.executeTakeFirst();
};
