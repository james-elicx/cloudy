'use client';

import { twMerge } from 'tailwind-merge';
import type { FileObject } from '@/utils';
import type { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useObjectExplorer, useExplorerEvents } from '../providers';

type Props = {
	row: Row<FileObject>;
	virtualRowSize: number;
	handleClick: (e: React.MouseEvent<HTMLElement>, object: FileObject) => void;
};

export const ObjectRow = ({ row, virtualRowSize, handleClick }: Props): JSX.Element => {
	const { selectedObjects } = useObjectExplorer();
	const { handleDoubleClick } = useExplorerEvents();

	const object = row.original;
	const isSelected = selectedObjects.has(object.path);

	return (
		<>
			{/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
			<div
				role="row"
				className={twMerge(
					'flex select-none flex-row items-center text-sm', // table-row?
					'rounded-md border-1 border-transparent',
					isSelected &&
						'border-accent !bg-secondary dark:border-accent-dark dark:!bg-secondary-dark',
				)}
				style={{ height: virtualRowSize }}
				onMouseDown={(e) => handleClick(e, object)}
				onDoubleClick={() => handleDoubleClick(object)}
			>
				{row.getVisibleCells().map((cell) => (
					<div key={cell.id} className="table-cell" style={{ width: cell.column.getSize() }}>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</div>
				))}
			</div>
		</>
	);
};

export type { Props as ObjectRowProps };
