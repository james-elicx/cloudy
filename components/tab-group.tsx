'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

type Props = {
	tabs: { label: string; href: string; disabled?: boolean; exactMatch?: boolean }[];
};

export const TabGroup = ({ tabs }: Props): JSX.Element => {
	const pathname = usePathname();

	const isActive = (path: string, exactMatch = false) =>
		exactMatch ? pathname === path : pathname.startsWith(path);

	return (
		<div className="flex border-spacing-1 flex-row items-center gap-2 border-b-1 border-secondary-dark/20 text-sm">
			{tabs.map(({ label, href, disabled, exactMatch }) => (
				<Link
					key={`page-tab-${label}-${href}`}
					prefetch={false}
					href={href}
					className={twMerge(
						'-mb-[1px] border-b-1 border-transparent px-2 py-1 font-normal opacity-70 transition-all hover:border-secondary-dark hover:opacity-100',
						isActive(href, exactMatch) && 'border-secondary-dark font-medium opacity-100',
						disabled && 'pointer-events-none',
					)}
				>
					{label}
				</Link>
			))}
		</div>
	);
};
