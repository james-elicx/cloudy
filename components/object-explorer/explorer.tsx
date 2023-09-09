'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { ColumnDef, Row, SortingState } from '@tanstack/react-table';
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { parseObject } from '@/utils';
import { useOnClickOutside } from '@/utils/hooks';
import { alphanumeric } from '@/utils/compare-alphanumeric-patched';
import { getFileIcon, getSortIcon } from './file-icons';
import { ObjectRow } from './object-row';
import { useExplorerEvents, useFilePreview, useObjectExplorer } from '../providers';

type Props = {
	initialObjects: (R2Object | string)[];
	initialCursor?: string;
};

// TODO: Settings context that persists size and order of columns

export const ObjectExplorer = ({ initialObjects, initialCursor }: Props): JSX.Element => {
	const parentRef = useRef<HTMLDivElement>(null);

	const { isFilePreviewActive } = useFilePreview();

	const {
		objects = initialObjects,
		selectedObjects,
		addSelectedObject,
		removeSelectedObject,
		updateObjects,
		tryFetchMoreObjects,
		clearSelectedObjects,
	} = useObjectExplorer();

	useLayoutEffect(
		() => updateObjects(initialObjects, { clear: true, cursor: initialCursor }),
		[updateObjects, initialObjects, initialCursor],
	);

	// disable if the file is currently being previewed so that we don't lose the focus.
	useOnClickOutside(parentRef, clearSelectedObjects, isFilePreviewActive);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const el = e.target as HTMLDivElement | null;
			if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 500) {
				tryFetchMoreObjects();
			}
		},
		[tryFetchMoreObjects],
	);

	const columns = useMemo<ColumnDef<R2Object | string>[]>(
		() => [
			{
				header: 'Name',
				minSize: 400,
				enableSorting: true,
				// @ts-expect-error - Typescript doesn't know it's a custom sorting function.
				sortingFn: 'alphanumeric_foldersTop',
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
			alphanumeric_foldersTop: (rowA, rowB, columnId) => {
				if (
					rowA.getValue<string>('Type') === 'folder' ||
					rowB.getValue<string>('Type') === 'folder'
				) {
					// Folders should be grouped at the top for asc, and at the bottom for desc.
					return 1;
				}

				return alphanumeric(rowA, rowB, columnId);
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
	const totalSize = rowVirtualizer.getTotalSize();

	const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
	const paddingBottom =
		virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

	const { handleDoubleClick } = useExplorerEvents();

	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (isFilePreviewActive) return;

			const getFirstSelected = () => selectedObjects.values().next().value as string;
			const getLastSelected = () => [...selectedObjects.values()].reverse()[0] as string;

			const getRowPath = (row: Row<R2Object | string>) =>
				typeof row.original === 'string' ? row.original : row.original.key;
			const getIndex = (key: string) => rows.findIndex((row) => key === getRowPath(row));

			switch (e.key) {
				case 'Enter': {
					// trigger preview for selected objects.
					if (selectedObjects.size === 1) {
						const nextObj = selectedObjects.values().next().value as string;
						handleDoubleClick({
							isDirectory: nextObj.endsWith('/'),
							path: nextObj,
						});
					} else if (selectedObjects.size > 1) {
						// eslint-disable-next-line no-console
						console.warn('Multiple objects selected. Preview not supported.');
					}
					e.stopPropagation();
					e.preventDefault();
					break;
				}
				case 'ArrowDown': {
					if (selectedObjects.size === 0) {
						const first = rows[0];
						if (first) addSelectedObject(getRowPath(first), !e.shiftKey);
					} else {
						const firstSelected = getFirstSelected();
						const firstSelectedIdx = getIndex(firstSelected);
						const lastSelected = getLastSelected();
						const lastSelectedIdx = getIndex(lastSelected);

						if (firstSelectedIdx === -1 || lastSelectedIdx === -1) {
							// do nothing
						} else if (firstSelectedIdx > lastSelectedIdx) {
							removeSelectedObject(lastSelected);
						} else {
							const nextObj = rows[lastSelectedIdx + 1];
							if (nextObj) addSelectedObject(getRowPath(nextObj), !e.shiftKey);
						}
					}
					e.stopPropagation();
					e.preventDefault();
					break;
				}
				case 'ArrowUp': {
					if (selectedObjects.size === 0 && rows[0]) {
						const last = rows[rows.length - 1];
						if (last) addSelectedObject(getRowPath(last), !e.shiftKey);
					} else {
						const firstSelected = getFirstSelected();
						const firstSelectedIdx = getIndex(firstSelected);
						const lastSelected = getLastSelected();
						const lastSelectedIdx = getIndex(lastSelected);

						if (firstSelectedIdx === -1 || lastSelectedIdx === -1) {
							// do nothing
						} else if (firstSelectedIdx < lastSelectedIdx) {
							removeSelectedObject(lastSelected);
						} else {
							const nextObj = rows[lastSelectedIdx - 1];
							if (nextObj) addSelectedObject(getRowPath(nextObj), !e.shiftKey);
						}
					}
					e.stopPropagation();
					e.preventDefault();
					break;
				}
				case 'Escape': {
					clearSelectedObjects();
					break;
				}
				default:
					break;
			}
		},
		[
			addSelectedObject,
			clearSelectedObjects,
			handleDoubleClick,
			isFilePreviewActive,
			removeSelectedObject,
			rows,
			selectedObjects,
		],
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);

		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);

	return (
		<div className="flex flex-col">
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

			<div
				className="table-row-group max-h-[calc(100vh-100px)] overflow-y-auto [&>:nth-child(odd)]:bg-secondary/40 dark:[&>:nth-child(odd)]:bg-secondary-dark/40"
				onScroll={handleScroll}
				ref={parentRef}
			>
				{paddingTop > 0 && <div style={{ height: `${paddingTop}px` }} />}
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index];
					if (!row) return null;

					return <ObjectRow key={row.id} row={row} virtualRowSize={virtualRow.size} />;
				})}
				{paddingBottom > 0 && <div style={{ height: `${paddingBottom}px` }} />}
			</div>
		</div>
	);
};
