'use client';

import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { addLeadingSlash, formatFullPath, formatBucketName } from '@/utils';
import { ThemeToggle } from '../providers';
import { ArrowLeft, ArrowRight, CaretRight } from '../icons';
import { UploadFileButton } from '../file-upload';

const TopNavSection = ({ children }: { children: React.ReactNode }): JSX.Element => (
	<div className="flex flex-row items-center gap-4">{children}</div>
);

type FormattedSegment = { segment: string; path: string };
const formatSegments = (segments: string[]) => {
	const allSegments = segments
		.map((path) => decodeURIComponent(path))
		.join('/')
		.replace(/\/\//, '/')
		.split('/')
		.flat();

	const firstIsBucket = allSegments[0] === 'bucket';

	let formattedSegments = allSegments.map((segment, i) => ({
		segment: i === 1 && firstIsBucket ? formatBucketName(segment) : segment,
		path: addLeadingSlash(allSegments.slice(0, i + 1).join('/')),
	}));
	if (firstIsBucket) formattedSegments = formattedSegments.slice(1);

	const sliced = formattedSegments.slice(-3);
	return formattedSegments.length > sliced.length
		? [formattedSegments[0] as FormattedSegment, { segment: '...', path: '#' }, ...sliced.slice(-2)]
		: sliced;
};

export const TopNav = (): JSX.Element => {
	const router = useRouter();
	const rawSegments = useSelectedLayoutSegments();

	const pathSegments = useMemo(() => formatSegments(formatFullPath(rawSegments)), [rawSegments]);

	return (
		<div className="flex max-h-[3rem] min-h-[3rem] flex-row items-center justify-between border-b-1 border-secondary px-4 py-2 dark:border-secondary-dark">
			<TopNavSection>
				<div className="flex flex-row items-center gap-2">
					<button type="button" onClick={() => router.back()}>
						<ArrowLeft weight="bold" className="h-5 w-5" />
					</button>

					<button type="button" onClick={() => router.forward()}>
						<ArrowRight weight="bold" className="h-5 w-5" />
					</button>
				</div>

				<div className="flex flex-row items-center gap-1">
					{pathSegments.map(({ segment, path }, index) => (
						<div className="flex flex-row items-center gap-1" key={`${segment}-${path}`}>
							{index !== 0 && <CaretRight weight="bold" className="h-3 w-3" />}
							<Link
								type="button"
								href={path}
								className={`${
									index === pathSegments.length - 1 ? 'font-bold' : 'font-medium'
								} hover:underline`}
							>
								{segment}
							</Link>
						</div>
					))}
				</div>
			</TopNavSection>

			<TopNavSection>
				<UploadFileButton />

				<ThemeToggle />
			</TopNavSection>
		</div>
	);
};
