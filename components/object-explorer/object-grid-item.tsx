'use client';

import { twMerge } from 'tailwind-merge';
import type { FileObject } from '@/utils';
import type { Row } from '@tanstack/react-table';
import { useObjectExplorer, useExplorerEvents } from '../providers';
import { ObjectPreviewInner } from './object-preview-inner';

type Props = {
	row: Row<FileObject>;
	handleClick: (e: React.MouseEvent<HTMLElement>, object: FileObject) => void;
	style: React.CSSProperties;
	previewSize: number;
};

export const ObjectGridItem = ({ row, handleClick, style, previewSize }: Props): JSX.Element => {
	const { selectedObjects } = useObjectExplorer();
	const { handleDoubleClick } = useExplorerEvents();

	const object = row.original;
	const isSelected = selectedObjects.has(object.path);

	return (
		<button
			className="flex flex-col justify-between truncate"
			type="button"
			onMouseDown={(e) => handleClick(e, object)}
			onDoubleClick={() => handleDoubleClick(object)}
			style={{ position: 'absolute', top: 0, left: 0, ...style }}
		>
			<div
				className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-secondary/30 dark:bg-secondary-dark/30"
				style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
			>
				<ObjectPreviewInner path={object.path} type={object.getType()} />
			</div>
			<span
				className={twMerge(
					'mx-auto max-w-full truncate text-sm font-semibold',
					'select-none rounded-md px-1 py-[0.0725rem]',
					'border-1 border-transparent',
					isSelected &&
						'border-accent !bg-secondary dark:border-accent-dark dark:!bg-secondary-dark',
				)}
				title={object.getName()}
			>
				{object.getName()}
			</span>
		</button>
	);
};

export type { Props as ObjectGridItemProps };
