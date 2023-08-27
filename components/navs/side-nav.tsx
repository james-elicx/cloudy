'use client';

import { formatBucketName } from '@/utils/r2';
import { useLocation } from '../providers';
import { HardDrives } from '../icons';
import { NavLink } from './nav-link';

export const SideNav = (): JSX.Element => {
	const { buckets } = useLocation();

	return (
		<nav className="flex min-w-2xs max-w-2xs flex-grow flex-col gap-4 border-r-1 border-secondary  bg-secondary/20 p-4 dark:border-secondary-dark dark:bg-secondary-dark/20">
			<h4>Cloudy</h4>

			<NavLink href="/" className="font-medium">
				Overview
			</NavLink>

			<div className="flex flex-col gap-1">
				<span className="text-sm font-semibold">R2 Buckets</span>

				{buckets.map((bucketName) => (
					<NavLink key={bucketName} href={`/bucket/${bucketName}`} exact={false}>
						<HardDrives weight="bold" className="h-5 w-5" /> {formatBucketName(bucketName)}
					</NavLink>
				))}
			</div>
		</nav>
	);
};
