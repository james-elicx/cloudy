'use client';

import { CaretCircleDown } from '@/components';
import type { VisibilityRecord } from '@/utils/db/queries';
import { useOnClickOutside } from '@/utils/hooks';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useRef } from 'react';
import { useAction } from 'next-safe-action/hook';
import type { updateVisibility } from '@/utils/actions/access-control';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export type VisibilityTableRecord = Omit<VisibilityRecord, 'id' | 'createdAt'> & {
	id?: number;
	createdAt?: Date;
};

type Props = {
	records: VisibilityTableRecord[];
	updateVisibilityAction: typeof updateVisibility;
};

export const VisibilityTable = ({ records, updateVisibilityAction }: Props): JSX.Element => {
	const columns = useMemo<ColumnDef<VisibilityTableRecord>[]>(
		() => [
			{
				header: 'Kind',
				accessorFn: (record) => record.kind,
				cell: (cell) => <span>{cell.getValue<string>()}</span>,
			},
			{
				header: 'Key',
				minSize: 200,
				accessorFn: (record) => record.key,
				cell: (cell) => <span>{cell.getValue<string>()}</span>,
			},
			{
				header: 'Glob',
				minSize: 300,
				accessorFn: (record) => record.glob,
				cell: (cell) => <span>{cell.getValue<string>()}</span>,
			},
			{
				header: 'Visibility',
				accessorFn: (record) => record.public,
				cell: (cell) => <span>{cell.getValue<boolean>() ? 'Public' : 'Private'}</span>,
			},
			{
				header: 'Permissions',
				accessorFn: (record) => record.readOnly,
				cell: (cell) => (
					<span
						className={twMerge(
							!cell.row.original.public && 'cursor-default select-none opacity-50',
						)}
					>
						{cell.getValue<boolean>() ? 'Read Only' : 'Read and Write'}
					</span>
				),
			},
			{
				id: 'edit_dialog',
				cell: (cell) => (
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					<UpdateVisibilityCell record={cell.row.original} action={updateVisibilityAction} />
				),
			},
		],
		[updateVisibilityAction],
	);

	const table = useReactTable({
		data: useMemo(() => records, [records]),
		columns,
		defaultColumn: { minSize: 100, maxSize: 1000 },
		getCoreRowModel: useMemo(() => getCoreRowModel(), []),
		debugTable: true,
	});

	const { rows } = table.getRowModel();

	return (
		<div className="flex flex-col">
			<div className="table-header-group">
				{table.getHeaderGroups().map((headerGroup) => (
					<div key={headerGroup.id} className="flex flex-grow flex-row py-2 pl-2">
						{headerGroup.headers.map((header) => (
							<button
								type="button"
								disabled
								key={header.id}
								className="flex flex-row items-center justify-between text-left text-sm font-normal"
								style={{ width: header.column.getSize() }}
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</button>
						))}
					</div>
				))}
			</div>

			<div className="table-row-group [&>:nth-child(odd)]:bg-secondary/40 dark:[&>:nth-child(odd)]:bg-secondary-dark/40">
				{rows.map((row) => (
					<div
						key={row.id}
						role="row"
						className="flex flex-row items-center rounded-md pl-2 text-sm"
						style={{ height: 40 }}
					>
						{row.getVisibleCells().map((cell) => (
							<div key={cell.id} className="table-cell" style={{ width: cell.column.getSize() }}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export type { Props as VisibilityTableProps };

type UpdateVisibilityCellProps = {
	action: typeof updateVisibility;
	record: VisibilityTableRecord;
};
const UpdateVisibilityCell = ({ action, record }: UpdateVisibilityCellProps) => {
	const router = useRouter();

	const dialogRef = useRef<HTMLDialogElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const { execute, isExecuting } = useAction(action, {
		onSuccess: () => router.refresh(),
		onError: ({ fetchError, serverError, validationError }, reset) => {
			// eslint-disable-next-line no-console
			console.error('Error updating visibility', fetchError, serverError, validationError);

			// eslint-disable-next-line no-alert
			alert('Error updating visibility');

			reset();
		},
	});

	useOnClickOutside([dialogRef, buttonRef], () => dialogRef.current?.close());

	return (
		<div className="relative w-fit">
			<button
				type="button"
				className="flex flex-row items-center justify-between text-left text-sm font-normal"
				onClick={() =>
					dialogRef.current?.open ? dialogRef.current?.close() : dialogRef.current?.show()
				}
				ref={buttonRef}
			>
				<CaretCircleDown weight="bold" className="h-5 w-5" />
			</button>

			<dialog
				ref={dialogRef}
				className="mr-0 mt-1 w-32 rounded-md border-1 border-accent/30 bg-secondary dark:border-accent-dark/30 dark:bg-secondary-dark"
			>
				<button
					type="button"
					disabled={isExecuting}
					className="w-full rounded-md border-1 border-transparent p-1 text-left hover:border-accent/60 disabled:cursor-not-allowed dark:hover:border-accent-dark/60"
					onClick={() => execute({ ...record, public: !record.public })}
				>
					Make {record.public ? 'Private' : 'Public'}
				</button>

				<button
					type="button"
					disabled={isExecuting}
					className="w-full rounded-md border-1 border-transparent p-1 text-left hover:border-accent/60 disabled:cursor-not-allowed dark:hover:border-accent-dark/60"
					onClick={() => execute({ ...record, readOnly: !record.readOnly })}
				>
					{record.readOnly ? 'Disable' : 'Enable'} Read Only
				</button>
			</dialog>
		</div>
	);
};
