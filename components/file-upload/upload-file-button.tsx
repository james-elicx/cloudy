'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadSimple, XCircle } from '../icons';
import { useLocation } from '../providers';
import type { DroppedFiles } from './drop-zone';
import { DropZone } from './drop-zone';
import { UploadFileRow } from './upload-file-row';

export const UploadFileButton = (): JSX.Element => {
	const router = useRouter();
	const { currentBucket, location } = useLocation();
	const locationPath = [...(currentBucket ? [currentBucket.parsed] : []), ...location].join('/');

	const modal = useRef<HTMLDialogElement>(null);
	const [droppedFiles, setDroppedFiles] = useState<DroppedFiles | null>(null);

	useEffect(() => {
		const onCloseModal = () => {
			setDroppedFiles(null);
			router.refresh();
		};

		const modalInstance = modal.current;

		modalInstance?.addEventListener('close', onCloseModal);

		return () => {
			modalInstance?.removeEventListener('close', onCloseModal);
		};
	}, [modal, router]);

	return (
		<>
			<button type="button" onClick={() => modal.current?.showModal()} disabled={!currentBucket}>
				<UploadSimple
					weight="bold"
					className="h-5 w-5 transition-colors hover:text-accent dark:hover:text-accent-dark"
				/>
			</button>

			<dialog
				ref={modal}
				className="z-10 w-full max-w-sm rounded-md border-1 border-secondary-dark/20 p-4 outline-none  backdrop:bg-secondary/30 dark:border-secondary/20 dark:backdrop:bg-secondary-dark/30"
			>
				<div className="flex flex-col items-center gap-2">
					<div className="flex w-full flex-row justify-center">
						<h5>Upload Files</h5>

						<button type="button" onClick={() => modal.current?.close()}>
							<XCircle
								weight="bold"
								className="absolute right-2 top-2 h-4 w-4 text-secondary transition-colors hover:text-primary dark:text-secondary-dark hover:dark:text-primary-dark"
							/>
						</button>
					</div>

					{droppedFiles?.valid?.length || droppedFiles?.invalid?.length ? (
						droppedFiles.valid.map((file) => (
							<UploadFileRow
								key={`${file.name}-${file.size}`}
								file={file}
								bucket={currentBucket?.raw ?? null}
								dirPath={location.join('/')}
							/>
						))
					) : (
						<DropZone onDrop={(files) => setDroppedFiles(files)} multiple>
							Drop a file here
						</DropZone>
					)}

					<span
						className="w-full truncate pt-2 text-left text-xs text-secondary dark:text-secondary-dark"
						title={locationPath}
					>
						<span className="mr-1 font-semibold">Location:</span>
						{locationPath}
					</span>
				</div>
			</dialog>
		</>
	);
};
