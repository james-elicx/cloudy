'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { parseObject } from '@/utils';
import { useOnClickOutside } from '@/utils/hooks';
import { getFileIcon, getSortIcon } from './file-icons';
import { ObjectRow } from './object-row';
import { useObjectExplorer } from '../providers';

type Props = {
	objects: (R2Object | string)[];
};

// TODO: Settings context that persists size and order of columns

export const ObjectExplorer = ({ objects }: Props): JSX.Element => {
	const parentRef = useRef<HTMLDivElement>(null);

	const { clearSelectedObjects } = useObjectExplorer();

	useOnClickOutside(parentRef, clearSelectedObjects);

	const columns = useMemo<ColumnDef<R2Object | string>[]>(
		() => [
			{
				header: 'Name',
				minSize: 400,
				enableSorting: true,
				// @ts-expect-error - @tanstack/react-table doesn't know it's a custom sorting function here.
				sortingFn: 'localeCompare',
				accessorFn: (object) => parseObject(object).getName(),
				cell: (cell) => {
					const Icon = getFileIcon(parseObject(cell.row.original).getType());
					const value = cell.getValue<string>();

					return (
						<div className="flex flex-row items-center">
							<span className="min-w-[5rem]">
								<Icon weight="bold" className="mx-auto h-5 w-5" />
							</span>
							<span className="truncate font-medium" title={value}>
								{value}
							</span>
						</div>
					);
				},
			},
			{
				header: 'Type',
				enableSorting: true,
				sortingFn: 'text',
				accessorFn: (object) => parseObject(object).getType(),
				cell: (cell) => (
					<span className="rounded-md bg-secondary-dark/10 px-1 py-0.5 text-xs text-secondary/80 dark:bg-secondary/10 dark:text-secondary-dark/80">
						{cell.getValue<string>()}
					</span>
				),
			},
			{
				header: 'Size',
				enableSorting: true,
				sortingFn: 'basic',
				accessorFn: (object) => (parseObject(object).isDirectory ? 0 : (object as R2Object).size),
				cell: (cell) => <span>{parseObject(cell.row.original).getSize()}</span>,
			},
			{
				header: 'Last Modified',
				enableSorting: true,
				sortingFn: 'datetime',
				accessorFn: (object) => parseObject(object).getLastModified(),
				cell: (cell) => (
					<span suppressHydrationWarning>
						{cell.getValue<Date | null>()?.toLocaleDateString() ?? ''}
					</span>
				),
			},
		],
		[],
	);

	// Sort by file name by default.
	const [sorting, setSorting] = useState<SortingState>([{ id: 'Name', desc: false }]);

	// TODO: Resizing

	const table = useReactTable({
		data: useMemo(() => objects, [objects]),
		columns,
		defaultColumn: { minSize: 100, maxSize: 1000 },
		state: { sorting },
		enableSortingRemoval: false,
		sortingFns: {
			localeCompare: (rowA, rowB, columnId) => {
				if (
					rowA.getValue<string>('Type') === 'folder' ||
					rowB.getValue<string>('Type') === 'folder'
				) {
					// Folders should be grouped at the top for asc, and at the bottom for desc.
					return 1;
				}

				// Files should be sorted by locale compare.
				return rowA.getValue<string>(columnId).localeCompare(rowB.getValue<string>(columnId));
			},
		},
		onSortingChange: setSorting,
		getCoreRowModel: useMemo(() => getCoreRowModel(), []),
		getSortedRowModel: useMemo(() => getSortedRowModel(), []),
		debugTable: true,
	});

	const { rows } = table.getRowModel();

	const rowVirtualizer = useVirtualizer({
		count: rows.length, // Should this track some sort of count from R2?
		estimateSize: () => 40,
		getScrollElement: useCallback(() => parentRef.current, []),
		overscan: 25,
	});

	const virtualRows = rowVirtualizer.getVirtualItems();

	return (
		<div ref={parentRef} className="flex flex-col">
			<div className="table-header-group">
				{table.getHeaderGroups().map((headerGroup) => (
					<div key={headerGroup.id} className="flex flex-grow flex-row py-2">
						{headerGroup.headers.map((header) => (
							<button
								key={header.id}
								type="button"
								className={twMerge(
									'flex flex-row items-center justify-between text-left text-sm font-normal',
									header.index === 0 && 'pl-20', // padding due to the icon being in the file name column
									header.column.getIsSorted() && 'font-medium',
									header.column.getCanSort() && 'cursor-pointer select-none',
								)}
								style={{ width: header.column.getSize() }}
								onClick={header.column.getToggleSortingHandler()}
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
								{getSortIcon(header.column.getIsSorted())}
							</button>
						))}
					</div>
				))}
			</div>

			<div className="table-row-group [&>:nth-child(odd)]:bg-secondary/40 dark:[&>:nth-child(odd)]:bg-secondary-dark/40">
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index];
					if (!row) return null;

					return <ObjectRow key={row.id} row={row} virtualRowSize={virtualRow.size} />;
				})}
			</div>
		</div>
	);
};
