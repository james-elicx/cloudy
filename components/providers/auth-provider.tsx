'use client';

import type { User } from '@/utils/auth';
import { createContext, useContext, useMemo, useState } from 'react';

export type IAuthContext = {
	isAuthEnabled: boolean;
	user: User | null;
};

const AuthContext = createContext<IAuthContext>({
	isAuthEnabled: false,
	user: null,
});

export const useAuth = () => useContext(AuthContext);

type Props = {
	children: React.ReactNode;
	user: User | undefined | null;
};

export const AuthProvider = ({ children, user: passedUser }: Props): JSX.Element => {
	const isAuthEnabled = useMemo(() => typeof passedUser !== 'undefined', [passedUser]);

	const [user] = useState<User | null>(passedUser ?? null);

	return (
		<AuthContext.Provider value={useMemo(() => ({ isAuthEnabled, user }), [isAuthEnabled, user])}>
			{children}
		</AuthContext.Provider>
	);
};

export type { Props as AuthProviderProps };
