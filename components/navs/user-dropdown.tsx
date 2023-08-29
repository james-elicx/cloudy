'use client';

import { useRef } from 'react';
import { useOnClickOutside } from '@/utils/hooks';
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { CaretDown } from '../icons';

type Props = { user: Session['user']; canAuth: boolean };

export const UserDropdown = ({ user, canAuth }: Props): JSX.Element => {
	const dialog = useRef<HTMLDialogElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const btnRef = useRef<HTMLButtonElement>(null);

	useOnClickOutside([innerRef, btnRef], () => dialog.current?.close());

	const name = user?.name ?? user?.email ?? 'Guest';

	return (
		<div className="relative">
			<button
				type="button"
				className="flex w-full flex-row items-center justify-between truncate rounded-md border-1 border-accent/20 bg-secondary px-2 py-1 font-medium text-primary dark:border-accent-dark/20 dark:bg-secondary-dark dark:text-primary-dark"
				onClick={() => (dialog.current?.open ? dialog.current?.close() : dialog.current?.show())}
				ref={btnRef}
			>
				{name} <CaretDown weight="bold" className="h-4 w-4" />
			</button>

			<dialog
				ref={dialog}
				className="mt-1 w-full rounded-md border-1 border-accent/20 bg-secondary text-primary dark:border-accent-dark/20 dark:bg-secondary-dark dark:text-primary-dark"
			>
				<div ref={innerRef} className=" ">
					<button
						type="button"
						className="flex w-full flex-row items-center truncate rounded-md border-1 border-transparent px-2 py-1 hover:border-accent/60 dark:hover:border-accent-dark/60"
					>
						{name}
					</button>

					<hr className="border-accent/20 dark:border-accent-dark/20" />

					<button
						title={!canAuth ? 'Auth is not available' : ''}
						disabled={!canAuth}
						type="button"
						className="flex w-full flex-row items-center justify-center rounded-md border-1 border-transparent px-2 py-1 hover:border-accent/60 disabled:cursor-not-allowed disabled:text-secondary/50 dark:hover:border-accent-dark/60 dark:disabled:text-secondary-dark/50"
						onClick={() => canAuth && (user ? signOut() : signIn())}
					>
						{user ? 'Sign Out' : 'Sign In'}
					</button>
				</div>
			</dialog>
		</div>
	);
};
