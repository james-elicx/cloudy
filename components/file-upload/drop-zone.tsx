'use client';

import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { mergeRefs } from '@/utils/hooks';

type Props = {
	accept?: string[];
	multiple?: boolean;
	children?: React.ReactNode;
	className?: string;
	onDrop: (files: DroppedFiles) => void;
	inputRef?: React.MutableRefObject<HTMLInputElement | null> | null;
};

export type DroppedFiles = { valid: File[]; invalid: File[] };

export const DropZone = ({
	accept,
	multiple = false,
	children,
	className,
	onDrop,
	inputRef: customInputRef = null,
}: Props): JSX.Element => {
	const dropZoneRef = useRef<HTMLDivElement>(null);
	const dropZoneCounter = useRef<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const [isActive, setIsActive] = useState<boolean>(false);

	const hideZone = () => {
		dropZoneCounter.current = 0;
		setIsActive(false);
	};

	const handleDragEvent = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		switch (e.type) {
			case 'dragenter': {
				dropZoneCounter.current++;
				setIsActive(true);
				break;
			}
			case 'dragleave': {
				if (isActive) {
					dropZoneCounter.current--;
					if (dropZoneCounter.current === 0) hideZone();
				}
				break;
			}
			case 'dragover': {
				break;
			}
			case 'drop': {
				hideZone();

				const files: DroppedFiles = { valid: [], invalid: [] };

				for (let i = 0; i < e.dataTransfer.files.length; i++) {
					const file = e.dataTransfer.files[i];

					if (file && accept && (!file.type || !accept.includes(file.type))) {
						files.invalid.push(file);
					} else if (file) {
						files.valid.push(file);
					}
				}

				onDrop(files);
				break;
			}
			default: {
				break;
			}
		}
	};

	return (
		<>
			<input
				type="file"
				className="hidden"
				ref={mergeRefs([inputRef, customInputRef])}
				accept={accept?.join(',') || undefined}
				multiple={multiple}
				onChange={(e) =>
					handleDragEvent({
						...e,
						preventDefault: () => null,
						stopPropagation: () => null,
						dataTransfer: {
							files: e.target?.files ?? [],
						},
						type: 'drop',
					} as unknown as React.DragEvent<HTMLDivElement>)
				}
			/>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
			<div
				className={twMerge(
					'flex h-40 w-full cursor-pointer items-center justify-center rounded-lg bg-secondary/30 text-sm text-primary/50 transition-colors dark:bg-secondary-dark/30 dark:text-primary-dark/50',
					isActive &&
						'bg-secondary/50 text-primary dark:bg-secondary-dark/50 dark:text-primary-dark',
					className,
				)}
				ref={dropZoneRef}
				onDragEnter={handleDragEvent}
				onDragLeave={handleDragEvent}
				onDragOver={handleDragEvent}
				onDrop={handleDragEvent}
				onClick={() => inputRef.current?.click()}
			>
				{children}
			</div>
		</>
	);
};
