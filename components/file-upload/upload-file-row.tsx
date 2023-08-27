'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { bytesToString } from '@/utils/hooks';
import { UploadSimple } from '../icons';
import { addLeadingSlash } from '../providers';

type Props = {
	bucket: string | null;
	dirPath: string;
	file: File;
};

export const UploadFileRow = ({ bucket, dirPath, file }: Props) => {
	const req = useRef<XMLHttpRequest>(new XMLHttpRequest());

	const [isUploading, setIsUploading] = useState(false);
	const [isDone, setIsDone] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const reqInstance = req.current;

		const onProgress = ({ loaded, total }: ProgressEvent) =>
			setProgress(Math.round((loaded / total) * 100));
		const onLoad = () => {
			setIsUploading(false);
			setProgress(0);
		};
		const onError = () => {
			setIsUploading(false);
			setError('An error occurred while uploading the file');
		};
		const onAbort = () => {
			setIsUploading(false);
			setError('The upload has been canceled by the user or the browser dropped the connection');
		};
		const onStart = () => {
			setIsDone(false);
			setIsUploading(true);
			setError(null);
		};
		const onDone = () => {
			setIsUploading(false);
			setIsDone(true);

			if (reqInstance?.status !== 200) {
				const resp = reqInstance?.responseText;
				setError(resp || 'An error occurred while uploading the file');
			} else {
				setProgress(100);
			}
		};

		reqInstance?.upload?.addEventListener('progress', onProgress);
		reqInstance?.addEventListener('load', onLoad);
		reqInstance?.addEventListener('loadstart', onStart);
		reqInstance?.addEventListener('loadend', onDone);
		reqInstance?.addEventListener('error', onError);
		reqInstance?.addEventListener('abort', onAbort);

		return () => {
			reqInstance?.upload?.removeEventListener('progress', onProgress);
			reqInstance?.removeEventListener('load', onLoad);
			reqInstance?.removeEventListener('loadend', onDone);
			reqInstance?.removeEventListener('loadstart', onStart);
			reqInstance?.removeEventListener('error', onError);
			reqInstance?.removeEventListener('abort', onAbort);
		};
	}, []);

	const uploadFile = useCallback(async () => {
		const reqInstance = req.current;

		const key = addLeadingSlash(`${dirPath}/${file.name}`).replace(/\/+/g, '/');
		const fileInfo = btoa(JSON.stringify({ bucket, key }));

		reqInstance?.open('PUT', `/api/bucket/${bucket}`);
		reqInstance?.setRequestHeader('x-content-type', file.type);

		const formData = new FormData();
		formData.append(fileInfo, file);
		reqInstance?.send(formData);
	}, [bucket, dirPath, file]);

	return (
		<div key={`${file.name}-${file.size}`} className="flex w-full flex-row items-center gap-1">
			<div className="flex flex-grow flex-col truncate">
				<span className="truncate" title={file.name}>
					{file.name}
				</span>

				<div className="grid grid-cols-2 text-xs">
					<span>{file.type || 'unknown type'}</span>
					<span>{bytesToString(file.size)}</span>
				</div>

				{error && <span className="text-xs text-status-error">{error}</span>}
			</div>

			<button
				disabled={isUploading || progress > 0}
				type="button"
				aria-label="Upload file"
				className={twMerge(
					'flex h-7 w-7 items-center justify-center rounded-full border-1 border-secondary-dark/20 bg-background px-1 transition-[background] duration-75 hover:bg-secondary hover:bg-opacity-30 disabled:cursor-not-allowed dark:border-secondary-dark/20 dark:bg-secondary-dark',
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
									'radial-gradient(closest-side, rgb(250 250 250 / var(--tw-bg-opacity)) 79%, transparent 80% 100%), conic-gradient(rgb(33 150 253 / var(--tw-text-opacity)) var(--upload-progress), rgb(33 150 253 / 0.3) 0)',
							}),
					} as React.CSSProperties
				}
				onClick={() => !isUploading && progress === 0 && uploadFile()}
			>
				<UploadSimple weight="bold" className="h-4 w-4" />
			</button>
		</div>
	);
};
