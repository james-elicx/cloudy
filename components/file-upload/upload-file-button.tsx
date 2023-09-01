'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { UploadSimple, XCircle } from '../icons';
import { useLocation, useUploadFiles } from '../providers';
import { DropZone } from './drop-zone';
import { UploadFileRow } from './upload-file-row';

export const UploadFileButton = (): JSX.Element => {
	const router = useRouter();
	const { currentBucket, location } = useLocation();
	const directoryStr = location.join('/');
	const locationPath = [...(currentBucket ? [currentBucket.parsed] : []), directoryStr].join('/');

	const modal = useRef<HTMLDialogElement>(null);
	const { files, updateFiles, uploadFiles, progress, isDone, error, isUploading } =
		useUploadFiles();

	useEffect(() => {
		const onCloseModal = () => {
			updateFiles([]);
			router.refresh();
		};

		const modalInstance = modal.current;

		modalInstance?.addEventListener('close', onCloseModal);

		return () => {
			modalInstance?.removeEventListener('close', onCloseModal);
		};
	}, [modal, router, updateFiles]);

	return (
		<>
			<button
				type="button"
				onClick={() => modal.current?.showModal()}
				disabled={!currentBucket}
				className="transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-accent-dark"
			>
				<UploadSimple weight="bold" className="h-5 w-5" />
			</button>

			<dialog
				ref={modal}
				className="z-10 w-full max-w-sm rounded-md border-1 border-secondary-dark/20 p-4 outline-none  backdrop:bg-secondary/30 dark:border-secondary/20 dark:backdrop:bg-secondary-dark/30"
			>
				<div className="flex flex-col items-center gap-2">
					<div className="flex w-full flex-row justify-center">
						<h5>Upload Files</h5>

						<button
							type="button"
							onClick={() => modal.current?.close()}
							disabled={isUploading}
							className="disabled:cursor-not-allowed disabled:opacity-50"
						>
							<XCircle
								weight="bold"
								className="absolute right-2 top-2 h-4 w-4 text-secondary transition-colors hover:text-primary dark:text-secondary-dark hover:dark:text-primary-dark"
							/>
						</button>
					</div>

					{files?.length ? (
						<div className="flex max-h-40 w-full flex-col gap-2 overflow-y-auto scrollbar:w-1 scrollbar-track:bg-secondary/30 scrollbar-thumb:bg-secondary dark:scrollbar-track:bg-secondary-dark/30 dark:scrollbar-thumb:bg-secondary-dark">
							{files.map(({ file }) => (
								<UploadFileRow key={`${file.name}-${file.size}`} file={file} />
							))}
						</div>
					) : (
						<DropZone
							onDrop={(droppedFiles) =>
								updateFiles(droppedFiles.valid.map((file) => ({ dir: directoryStr, file })))
							}
							multiple
						>
							Drop your files here
						</DropZone>
					)}

					{error && <span className="text-xs text-status-error">{error}</span>}

					<div className="flex w-full flex-row justify-between">
						<span
							className="w-full truncate pt-2 text-left text-xs text-secondary dark:text-secondary-dark"
							title={locationPath}
						>
							<span className="mr-1 font-semibold">Location:</span>
							{locationPath}
						</span>

						<button
							disabled={!files.length || isUploading || progress > 0}
							type="button"
							aria-label="Upload file"
							className={twMerge(
								'flex h-7 w-7 items-center justify-center rounded-full border-1 border-secondary-dark/20 bg-background px-1 transition-[background] duration-75 hover:bg-secondary hover:bg-opacity-30 disabled:cursor-not-allowed dark:border-secondary-dark/20 dark:bg-background-dark dark:hover:bg-secondary-dark',
								!files.length && 'opacity-50',
								isUploading &&
									'border-status-info text-status-info dark:border-status-info dark:text-status-info',
								isDone &&
									progress === 100 &&
									'border-status-success text-status-success dark:border-status-success dark:text-status-success',
								error &&
									'border-status-error text-status-error dark:border-status-error dark:text-status-error',
							)}
							style={
								{
									'--upload-progress': `${progress}%`,
									...(!isDone &&
										isUploading && {
											background:
												'radial-gradient(closest-side, rgb(250 250 250 / 0) 79%, transparent 80% 100%), conic-gradient(rgb(33 150 253 / 0.6) var(--upload-progress), rgb(33 150 253 / 0.1) 0)',
										}),
								} as React.CSSProperties
							}
							onClick={() => !isUploading && progress === 0 && uploadFiles()}
						>
							<UploadSimple weight="bold" className="h-4 w-4" />
						</button>
					</div>
				</div>
			</dialog>
		</>
	);
};
