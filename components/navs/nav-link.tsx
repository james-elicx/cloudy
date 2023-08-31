'use client';

import { addLeadingSlash } from '@/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

type Props = {
	asButton?: () => void;
	href: string;
	children: React.ReactNode;
	active?: boolean;
	className?: string;
	exact?: boolean;
};

export const NavLink = ({
	asButton,
	href,
	children,
	active,
	className: passedClassName,
	exact = true,
}: Props) => {
	const pathname = usePathname();

	const hrefWithLeadingSlash = addLeadingSlash(href);
	const isActivePathname = exact
		? pathname === hrefWithLeadingSlash
		: pathname.startsWith(hrefWithLeadingSlash);

	const className = twMerge(
		'border-1 border-transparent -ml-1 flex flex-row items-center gap-1 rounded-md px-1 font-normal focus:border-accent/60 dark:focus:border-accent-dark/60',
		(active || isActivePathname) && 'bg-secondary dark:bg-secondary-dark',
		passedClassName,
	);

	return asButton ? (
		<button type="button" onClick={asButton} className={className}>
			{children}
		</button>
	) : (
		<Link prefetch={false} href={hrefWithLeadingSlash} className={className}>
			{children}
		</Link>
	);
};
