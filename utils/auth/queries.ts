import { cache } from 'react';
import type { AccessControlKind } from '../db';
import { q } from '../db';
import { getUserSession, isAuthAvailable } from './next-auth';

export type User = NonNullable<Awaited<ReturnType<typeof q.getUserById>>>;
export type AccessControlRule = NonNullable<
	Awaited<ReturnType<typeof q.getUserAccessControlForKey>>
>;

export const getUser = cache(async () => {
	try {
		if (!isAuthAvailable()) return null;

		const session = await getUserSession();
		if (!session) return session;

		const user = await q.getUserById(session.id);

		return user ?? null;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
		return null;
	}
});

export const getUserAccessControl = async (kind?: AccessControlKind) => {
	try {
		if (!isAuthAvailable()) return null;

		const session = await getUserSession();
		if (!session) return session;

		const rules = await q.getUserAccessControl(session.id, kind);

		return rules ?? null;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
		return null;
	}
};

export const getUserAccessControlRule = async (kind: AccessControlKind, key: string) => {
	try {
		if (!isAuthAvailable()) return null;

		const session = await getUserSession();
		if (!session) return session;

		const rule = await q.getUserAccessControlForKey(session.id, kind, key);

		return rule ?? null;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
		return null;
	}
};
