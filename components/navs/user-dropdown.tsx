'use client';

import { useRef } from 'react';
import { useOnClickOutside } from '@/utils/hooks';
import { signIn, signOut } from 'next-auth/react';
import { CaretDown } from '../icons';
import { useAuth } from '../providers/auth-provider';

export const UserDropdown = (): JSX.Element => {
	const { isAuthEnabled, user } = useAuth();

	const dialog = useRef<HTMLDialogElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const btnRef = useRef<HTMLButtonElement>(null);

	useOnClickOutside([innerRef, btnRef], () => dialog.current?.close());

	const displayName = user?.name ?? user?.email ?? 'Guest';

	return (
		<div className="relative">
			<button
				type="button"
				className="flex w-full flex-row items-center justify-between truncate rounded-md border-1 border-accent/20 bg-secondary px-2 py-1 font-medium text-primary dark:border-accent-dark/20 dark:bg-secondary-dark dark:text-primary-dark"
				onClick={() => (dialog.current?.open ? dialog.current?.close() : dialog.current?.show())}
				ref={btnRef}
			>
				{displayName} <CaretDown weight="bold" className="h-4 w-4" />
			</button>

			<dialog
				ref={dialog}
				className="mt-1 w-full rounded-md border-1 border-accent/20 bg-secondary text-primary dark:border-accent-dark/20 dark:bg-secondary-dark dark:text-primary-dark"
			>
				<div ref={innerRef}>
					<button
						type="button"
						className="flex w-full flex-row items-center truncate rounded-md border-1 border-transparent px-2 py-1 hover:border-accent/60 dark:hover:border-accent-dark/60"
					>
						{displayName}
					</button>

					<hr className="border-accent/20 dark:border-accent-dark/20" />

					<button
						title={!isAuthEnabled ? 'Auth is not available' : ''}
						disabled={!isAuthEnabled}
						type="button"
						className="flex w-full flex-row items-center justify-center rounded-md border-1 border-transparent px-2 py-1 hover:border-accent/60 disabled:cursor-not-allowed disabled:text-secondary/50 dark:hover:border-accent-dark/60 dark:disabled:text-secondary-dark/50"
						onClick={() => isAuthEnabled && (user ? signOut() : signIn())}
					>
						{user ? 'Sign Out' : 'Sign In'}
					</button>
				</div>
			</dialog>
		</div>
	);
};
