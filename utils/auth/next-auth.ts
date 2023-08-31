import { KyselyAdapter } from '@auth/kysely-adapter';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { cache } from 'react';
import { db } from '../db/schema';
import { q } from '../db';

const deriveAuthProviders = () => {
	const providers = [];

	if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
		providers.push(
			GitHub({
				clientId: process.env.AUTH_GITHUB_ID,
				clientSecret: process.env.AUTH_GITHUB_SECRET,
			}),
		);
	}

	return providers;
};

const deriveDatabaseAdapter = () => {
	if (db) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - Weird type errors that shouldn't be there.
		return KyselyAdapter(db);
	}

	return undefined;
};

const providers = deriveAuthProviders();
const adapter = deriveDatabaseAdapter();

const { handlers: nextAuthHandlers, auth } = NextAuth({
	trustHost: true,
	useSecureCookies: process.env.NODE_ENV === 'production',
	session: {
		strategy: 'jwt',
		maxAge: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 24 hours
	},
	providers,
	adapter,
	callbacks: {
		jwt: async ({ token, user }) => (user ? { ...token, id: user.id } : token),
		session: async ({ session, token }) => ({ ...session, user: token }),
	},
	events: {
		createUser: async ({ user }) => {
			const idAsNumber = Number(user.id);
			if (idAsNumber === 1) {
				await q.setUserIsAdmin(idAsNumber, true);
			}
		},
	},
});

export const isAuthAvailable = () => !!process.env.AUTH_SECRET && providers.length > 0 && !!adapter;

export const isGlobalReadOnly = () => !isAuthAvailable() && !!process.env.CLOUDY_READ_ONLY;

export const { GET, POST }: typeof nextAuthHandlers = {
	GET: async (req) =>
		isAuthAvailable() ? nextAuthHandlers.GET(req) : new Response('Not found', { status: 404 }),
	POST: async (req) =>
		isAuthAvailable() ? nextAuthHandlers.POST(req) : new Response('Not found', { status: 404 }),
};

export const getUserSession = cache(async () => {
	try {
		if (!isAuthAvailable()) {
			throw new Error('Auth is not available');
		}

		const session = await auth();

		return session?.user?.id ? session.user : null;
	} catch (e) {
		return undefined;
	}
});
