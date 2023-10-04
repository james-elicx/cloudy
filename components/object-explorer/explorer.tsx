'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { parseObject, type FileObject } from '@/utils';
import { useOnClickOutside } from '@/utils/hooks';
import { alphanumeric } from '@/utils/compare-alphanumeric-patched';
import { getFileIcon, getSortIcon } from './file-icons';
import { ObjectRow } from './object-row';
import { useExplorerEvents, useObjectExplorer } from '../providers';

type Props = {
	initialObjects: (string | R2Object)[];
	initialCursor?: string;
};

// TODO: Settings context that persists size and order of columns

export const ObjectExplorer = ({ initialObjects, initialCursor }: Props): JSX.Element => {
	const parentRef = useRef<HTMLDivElement>(null);

	const parsedInitialObjects = useMemo(
		() => initialObjects.map((o) => parseObject(o)),
		[initialObjects],
	);

	const {
		objects = parsedInitialObjects,
		selectedObjects,
		addSelectedObject,
		removeSelectedObject,
		updateObjects,
		tryFetchMoreObjects,
		clearSelectedObjects,
		isPreviewActive,
	} = useObjectExplorer();

	useLayoutEffect(
		() => updateObjects(parsedInitialObjects, { clear: true, cursor: initialCursor }),
		[updateObjects, parsedInitialObjects, initialCursor],
	);

	// disable if the file is currently being previewed so that we don't lose the focus.
	useOnClickOutside(
		parentRef,
		(e) => {
			// check if target element is child of preview pane and don't clear selection if it is.
			if (!document.getElementById('preview-pane')?.contains(e.target as Node)) {
				clearSelectedObjects();
			}
		},
		isPreviewActive,
	);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const el = e.target as HTMLDivElement | null;
			if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 500) {
				tryFetchMoreObjects();
			}
		},
		[tryFetchMoreObjects],
	);

	const columns = useMemo<ColumnDef<FileObject>[]>(
		() => [
			{
				header: 'Name',
				minSize: 400,
				enableSorting: true,
				// @ts-expect-error - Typescript doesn't know it's a custom sorting function.
				sortingFn: 'alphanumeric_foldersTop',
				accessorFn: (object) => object.getName(),
				cell: (cell) => {
					const Icon = getFileIcon(cell.row.original.getType());
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
				accessorFn: (object) => object.getType(),
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
				accessorFn: (object) => object.getSize(),
				cell: (cell) => <span>{cell.getValue<string>()}</span>,
			},
			{
				header: 'Last Modified',
				enableSorting: true,
				sortingFn: 'datetime',
				accessorFn: (object) => object.getLastModified(),
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

	const selectNextObject = useCallback(
		(opts: { up?: boolean; down?: boolean; shiftKey?: boolean }) => {
			const selectedObjs = [...selectedObjects.entries()];

			const missingObjVal = ['', { idx: -1 }] as const;
			const [firstObjKey, { idx: firstObjIdx }] = selectedObjs[0] ?? missingObjVal;
			const [lastObjKey, { idx: lastObjIdx }] =
				selectedObjs[selectedObjs.length - 1] ?? missingObjVal;

			if (firstObjIdx === -1 || lastObjIdx === -1) {
				// do nothing
			} else if (opts.down ? firstObjIdx > lastObjIdx : firstObjIdx < lastObjIdx) {
				removeSelectedObject(opts.down ? firstObjKey : lastObjKey);
			} else {
				const nextIdx = opts.down ? lastObjIdx + 1 : lastObjIdx - 1;
				const nextObj = rows[nextIdx];
				if (nextObj) addSelectedObject(nextObj.original.path, { idx: nextIdx }, !opts.shiftKey);
			}
		},
		[selectedObjects, removeSelectedObject, rows, addSelectedObject],
	);

	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (isPreviewActive) return;

			switch (e.key) {
				case 'Enter': {
					// trigger preview for selected objects.
					if (selectedObjects.size === 1) {
						const nextObj = selectedObjects.values().next().value as string;
						handleDoubleClick({ isDirectory: nextObj.endsWith('/'), path: nextObj });
					} else if (selectedObjects.size > 1) {
						// eslint-disable-next-line no-console
						console.warn('Multiple objects selected. Preview not supported.');
					}
					break;
				}
				case 'ArrowDown': {
					if (selectedObjects.size === 0) {
						const first = rows[0];
						if (first) addSelectedObject(first.original.path, { idx: 0 }, !e.shiftKey);
					} else {
						selectNextObject({ down: true, shiftKey: e.shiftKey });
					}
					break;
				}
				case 'ArrowUp': {
					if (selectedObjects.size === 0 && rows[0]) {
						const last = rows[rows.length - 1];
						if (last) addSelectedObject(last.original.path, { idx: rows.length - 1 }, !e.shiftKey);
					} else {
						selectNextObject({ up: true, shiftKey: e.shiftKey });
					}
					break;
				}
				case 'Escape': {
					clearSelectedObjects();
					break;
				}
				default:
					return;
			}

			e.stopPropagation();
			e.preventDefault();
		},
		[
			addSelectedObject,
			clearSelectedObjects,
			handleDoubleClick,
			isPreviewActive,
			rows,
			selectNextObject,
			selectedObjects,
		],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLElement>, object: FileObject, objInfo: { idx: number }) => {
			// We only trigger selection on left click.
			// `onMouseDown` is used instead of `onClick` so we can mark an object as selected on focusing instead of after the click completes.
			if (e.button !== 0) return;
			// TODO: Trigger context menu through this handler instead.

			if (e.ctrlKey || e.metaKey) {
				addSelectedObject(object.path, objInfo);
			} else if (e.shiftKey) {
				const [, { idx: lastSelectedIdx }] = [...selectedObjects.entries()].reverse()[0] as [
					string,
					{ idx: number },
				];

				if (lastSelectedIdx === -1) {
					addSelectedObject(object.path, objInfo);
				} else {
					for (let i = lastSelectedIdx; i <= objInfo.idx; i++) {
						const nextObj = rows[i];
						if (nextObj) addSelectedObject(nextObj.original.path, { idx: i });
					}
				}
			} else {
				addSelectedObject(object.path, objInfo, true);
			}
		},
		[addSelectedObject, rows, selectedObjects],
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);

		return () => document.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);

	return (
		<div className="table">
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

					return (
						<ObjectRow
							key={row.id}
							row={row}
							virtualRowSize={virtualRow.size}
							handleClick={(e, obj) => handleMouseDown(e, obj, { idx: virtualRow.index })}
						/>
					);
				})}
				{paddingBottom > 0 && <div style={{ height: `${paddingBottom}px` }} />}
			</div>
		</div>
	);
};
