'use client';

import type { updateCacheHeader } from '@/utils/actions/settings';
import type { SettingsRecord } from '@/utils/db/queries';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
	settings: Record<string, SettingsRecord> | undefined;
	updateCacheHeaderAction: typeof updateCacheHeader;
};

export const SettingsGrid = ({ settings, updateCacheHeaderAction }: Props) => {
	const router = useRouter();

	const [cacheHeader, setCacheHeader] = useState(settings?.['cache-header']?.value ?? '');

	const { execute, isExecuting } = useAction(updateCacheHeaderAction, {
		onSuccess: () => router.refresh(),
		onError: ({ error }) => {
			// eslint-disable-next-line no-console
			console.error('Error updating cache header', error);

			// eslint-disable-next-line no-alert
			alert('Error updating cache header');
		},
	});

	return (
		<div className="grid grid-cols-2">
			<div className="flex flex-col">
				<span className="font-semibold">Object Cache-Control Header</span>
				<span className="text-sm">The cache header applied to object GET response.</span>
				<div className="flex flex-row">
					<input
						type="text"
						className="w-full max-w-sm rounded-md rounded-r-none border border-secondary px-2 py-1 focus:border-accent/60 focus:outline-none dark:border-secondary-dark dark:focus:border-accent-dark/60"
						value={cacheHeader}
						onChange={(e) => setCacheHeader(e.target.value)}
					/>
					<button
						type="button"
						className="rounded-md rounded-l-none border border-secondary px-2 py-1 focus:border-accent/60 disabled:pointer-events-none disabled:opacity-50 dark:border-secondary-dark dark:focus:border-accent-dark/60"
						onClick={() => execute({ cacheHeader })}
						disabled={isExecuting}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};
