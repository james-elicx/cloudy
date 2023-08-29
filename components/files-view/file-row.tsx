'use client';

import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { parseObject } from '@/utils';
import type { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useFileExplorer, useFilePreview, useLocation } from '../providers';

type Props = {
	row: Row<R2Object | string>;
	virtualRowSize: number;
};

export const FileRow = ({ row, virtualRowSize }: Props): JSX.Element => {
	const router = useRouter();
	const { currentBucket } = useLocation();

	const { selectedObjects, addSelectedObject } = useFileExplorer();
	const { triggerFilePreview } = useFilePreview();

	const object = parseObject(row.original);
	const isSelected = selectedObjects.has(object.path);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		// We only trigger selection on left click.
		// `onMouseDown` is used instead of `onClick` so we can mark an object as selected on focusing instead of after the click completes.
		if (e.button !== 0) return;

		if (e.ctrlKey) {
			addSelectedObject(object.path);
		} else {
			addSelectedObject(object.path, true);
		}
	};

	const handleDoubleClick = () => {
		if (object.isDirectory) {
			router.push(`/bucket/${currentBucket?.raw}/${object.path}`);
		} else {
			triggerFilePreview(object.path);
		}
	};

	const handleContextMenu = () => {
		addSelectedObject(object.path, true);
		// TODO: Render a context menu.
	};

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
				onMouseDown={handleMouseDown}
				onDoubleClick={handleDoubleClick}
				onContextMenu={handleContextMenu}
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

export type { Props as BucketFileRowProps };
