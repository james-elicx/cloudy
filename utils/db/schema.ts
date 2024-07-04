import type { Generated, GeneratedAlways } from 'kysely';
import { Kysely } from 'kysely';
import { D1Dialect } from './kysely-d1';

type AccountId = number;
type UserId = number;
type SessionId = number;

export type Database = {
	User: {
		id: GeneratedAlways<UserId>;
		name: string | null;
		email: string;
		emailVerified: Date | null;
		image: string | null;
		createdAt: Generated<Date>;
		disabled: number;
		admin: number;
	};
	Account: {
		id: GeneratedAlways<AccountId>;
		userId: UserId;
		type: string;
		provider: string;
		providerAccountId: string;
		refresh_token: string | null;
		access_token: string | null;
		expires_at: number | null;
		token_type: string | null;
		scope: string | null;
		id_token: string | null;
		session_state: string | null;
	};
	Session: {
		id: GeneratedAlways<SessionId>;
		userId: UserId;
		sessionToken: string;
		expires: Date;
	};
	VerificationToken: {
		identifier: string;
		token: string;
		expires: Date;
	};
	AccessControl: {
		id: GeneratedAlways<number>;
		userId: UserId; // fkey
		createdAt: Generated<Date>;
		kind: number; // 0 = r2
		key: string;
		glob: string;
		hasRead: number;
		hasWrite: number;
	};
	Visibility: {
		id: GeneratedAlways<number>;
		createdAt: Generated<Date>;
		kind: number; // 0 = r2
		key: string;
		glob: string;
		public: number;
		readOnly: number;
	};
	Settings: {
		type: string;
		key: string;
		value: string;
		updatedAt: Generated<Date>;
		updatedBy: UserId; // fkey
	};
};

const getDatabaseFromEnv = () => {
	const d1 =
		process.env.NODE_ENV === 'development'
			? (process.env[process.env.DEV_CLOUDY_D1_BINDING_NAME || 'CLOUDY_D1_LOCAL'] as
					| D1Database
					| undefined)
			: process.env.CLOUDY_D1;
	if (d1) {
		return new Kysely<Database>({ dialect: new D1Dialect({ database: d1 }) });
	}

	return undefined;
};

export { getDatabaseFromEnv };
