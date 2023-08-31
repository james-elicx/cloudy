// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
	/**
	 * The shape of the user object returned in the OAuth providers' `profile` callback,
	 * or the second parameter of the `session` callback, when using a database.
	 */
	export interface User extends DefaultUser {
		/** Unique ID in the database. */
		id: number;
	}

	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	export interface Session {
		user: DefaultSession['user'] & {
			/** Unique ID in the database. */
			id: number;
		};
	}
}

declare module 'next-auth/jwt' {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends DefaultJWT {
		/** Unique ID in the database. */
		id: number;
	}
}
