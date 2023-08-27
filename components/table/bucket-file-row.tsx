'use client';

import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useRef, useState } from 'react';
import { useOnClickOutside, bytesToString } from '@/utils/hooks';
import { File, FolderSimple } from '../icons';
import { useFilePreview } from '../providers';

type Props = { bucketName: string; path: string } & (
	| { type: 'directory'; file?: never }
	| { type: 'file'; file: R2Object }
);

export const BucketFileRow = ({ bucketName, path, type, file }: Props): JSX.Element => {
	const router = useRouter();
	const { triggerFilePreview } = useFilePreview();

	const [isFocused, setIsFocused] = useState(false);
	const rowRef = useRef<HTMLTableRowElement>(null);

	useOnClickOutside(rowRef, () => setIsFocused(false));

	const Icon = type === 'directory' ? FolderSimple : File;

	const handleDoubleClick = () => {
		if (type === 'directory') {
			router.push(`/bucket/${bucketName}${path}`);
		} else {
			triggerFilePreview(file.key);
		}
	};

	return (
		<tr
			role="button"
			className={twMerge(
				'cursor-default truncate text-sm [&>*]:py-2',
				'[&>*]:border-y-1 [&>*]:border-transparent [&>:first-child]:rounded-l-md [&>:first-child]:border-l-1 [&>:last-child]:rounded-r-md [&>:last-child]:border-r-1',
				isFocused &&
					'[&>*]:!border-accent [&>*]:!bg-secondary dark:[&>*]:!border-accent-dark dark:[&>*]:!bg-secondary-dark',
			)}
			onClick={() => setIsFocused(true)}
			onDoubleClick={() => handleDoubleClick()}
			ref={rowRef}
		>
			<td className="items-center justify-center">
				<Icon weight="bold" className="mx-auto h-5 w-5" />
			</td>

			<td className="font-medium">{path.replace(/\/$/, '').replace(/.*\//, '')}</td>

			<td className="">
				{type === 'directory' ? 'Folder' : file.httpMetadata?.contentType ?? 'unknown'}
			</td>

			<td className="">{type === 'file' ? bytesToString(file.size) : ''}</td>

			<td className="">
				{type === 'file' && file.customMetadata?.['lastmod']
					? new Date(file.customMetadata['lastmod']).toLocaleString()
					: ''}
			</td>

			<td className="" aria-label="Filler" />
		</tr>
	);
};

export type { Props as BucketFileRowProps };
