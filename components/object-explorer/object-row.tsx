'use client';

import { twMerge } from 'tailwind-merge';
import { parseObject } from '@/utils';
import type { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useObjectExplorer, useExplorerEvents } from '../providers';

type Props = {
	row: Row<R2Object | string>;
	virtualRowSize: number;
};

export const ObjectRow = ({ row, virtualRowSize }: Props): JSX.Element => {
	const { selectedObjects } = useObjectExplorer();
	const { handleMouseDown, handleDoubleClick, handleContextMenu } = useExplorerEvents();

	const object = parseObject(row.original);
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
				onMouseDown={(e) => handleMouseDown(e, object)}
				onDoubleClick={() => handleDoubleClick(object)}
				onContextMenu={() => handleContextMenu(object)}
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
