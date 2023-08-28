'use client';

import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { BucketFileRow } from './bucket-file-row';
import { CaretDown, CaretUp } from '../icons';
import type { SortField, SortInfo } from '../providers';
import { SortableFilesProvider, useSortableFiles } from '../providers';

type Props = {
	directories: string[];
	files: R2Object[];
};

type ColumnHeaderProps = {
	children: React.ReactNode;
	field: SortField;
	className?: string;
};
const SortableColumnHeader = ({ children, field, className }: ColumnHeaderProps) => {
	const { sort, setSort } = useSortableFiles();

	return (
		<th className={className}>
			<button
				className={twMerge(
					'flex w-full flex-row items-center justify-between',
					sort.field === field && 'font-medium',
				)}
				type="button"
				onClick={() =>
					setSort((prev: SortInfo) => ({
						field,
						order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
					}))
				}
			>
				{children}
				{sort.field === field &&
					(sort.order === 'asc' ? (
						<CaretUp weight="bold" className="mr-2 h-3 w-3" />
					) : (
						<CaretDown className="mr-2 h-3 w-3" />
					))}
			</button>
		</th>
	);
};

const SortedObjectRows = ({ objects }: { objects: R2Object[] | string[] }) => {
	const { sort, sortObjects } = useSortableFiles();

	const sortedObjects = useMemo(
		() => sortObjects(objects, sort.field, sort.order),
		[objects, sort.field, sort.order, sortObjects],
	);

	return (
		<>
			{sortedObjects.map((object) =>
				typeof object === 'string' ? (
					<BucketFileRow key={`bucket-directory-${object}`} path={object} type="directory" />
				) : (
					<BucketFileRow
						key={`bucket-file-${object.key}`}
						path={object.key}
						type="file"
						file={object}
					/>
				),
			)}
		</>
	);
};

export const BucketFilesTable = ({ directories, files }: Props): JSX.Element => (
	<SortableFilesProvider>
		<table className="border-separate border-spacing-0">
			<thead>
				<tr className="text-left [&>*]:text-sm [&>*]:font-normal">
					<th aria-label="Icon" className="w-[6rem]" />
					<SortableColumnHeader field="name" className="w-[20rem] py-2">
						Name
					</SortableColumnHeader>
					<SortableColumnHeader field="type" className="w-[12rem]">
						Type
					</SortableColumnHeader>
					<SortableColumnHeader field="size" className="w-[12rem]">
						Size
					</SortableColumnHeader>
					<SortableColumnHeader field="lastModified" className="w-[12rem]">
						Last Modified
					</SortableColumnHeader>
				</tr>
			</thead>

			<tbody className="[&>:nth-child(odd)>*]:bg-secondary/40 dark:[&>:nth-child(odd)>*]:bg-secondary-dark/40">
				<SortedObjectRows objects={directories} />
				<SortedObjectRows objects={files} />
			</tbody>
		</table>
	</SortableFilesProvider>
);
