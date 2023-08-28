'use client';

import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '@/utils/hooks';
import { bytesToString, parseFileType } from '@/utils';
import { useFilePreview } from '../providers';
import { fileIconsMap } from './file-icons';

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

	const fileName = path.replace(/\/$/, '').replace(/.*\//, '');

	const namedType = parseFileType(type, fileName, file?.httpMetadata?.contentType);
	const Icon = fileIconsMap[namedType];

	const handleDoubleClick = () => {
		if (type === 'directory') {
			router.push(`/bucket/${bucketName}/${path}`);
		} else {
			triggerFilePreview(file.key);
		}
	};

	return (
		<tr
			role="button"
			className={twMerge(
				'cursor-default select-none truncate text-sm [&>*]:py-2',
				'[&>*]:border-y-1 [&>*]:border-transparent [&>:first-child]:rounded-l-md [&>:first-child]:border-l-1 [&>:last-child]:rounded-r-md [&>:last-child]:border-r-1',
				isFocused &&
					'[&>*]:!border-accent [&>*]:!bg-secondary dark:[&>*]:!border-accent-dark dark:[&>*]:!bg-secondary-dark',
			)}
			onClick={() => setIsFocused(true)}
			onDoubleClick={() => handleDoubleClick()}
			ref={rowRef}
		>
			<td>
				<Icon weight="bold" className="mx-auto h-5 w-5" />
			</td>

			<td className="font-medium">{fileName}</td>

			<td>
				<span className="rounded-md bg-secondary-dark/10 px-1 py-0.5 text-xs text-secondary/80 dark:bg-secondary/10 dark:text-secondary-dark/80">
					{namedType}
				</span>
			</td>

			<td>{type === 'file' ? bytesToString(file.size) : ''}</td>

			<td suppressHydrationWarning>
				{type === 'file' && file.customMetadata?.['mtime']
					? new Date(Number(file.customMetadata['mtime'])).toLocaleString()
					: ''}
			</td>
		</tr>
	);
};

export type { Props as BucketFileRowProps };
