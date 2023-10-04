'use client';

import { addLeadingSlash } from '@/utils';
import { useOnClickOutside } from '@/utils/hooks';
import { XCircle } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useObjectExplorer } from '../providers';

export const ObjectPreview = (): JSX.Element => {
	const { currentBucket } = useLocation();
	const { isPreviewActive, dismissPreview, selectedObjects } = useObjectExplorer();

	const abortController = useRef<AbortController>(new AbortController());
	const modal = useRef<HTMLDialogElement>(null);
	const modalInner = useRef<HTMLDivElement>(null);

	const [data, setData] = useState<R2Object | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isPreviewActive || !currentBucket) return;
		modal.current?.showModal();

		abortController.current = new AbortController();
		const controller = abortController.current;

		setIsLoading(true);

		const key = selectedObjects.keys().next().value;
		if (!key) {
			setError('No object selected');
			setIsLoading(false);
			return;
		}

		fetch(`/api/bucket/${currentBucket.raw}${addLeadingSlash(key)}`, {
			method: 'POST',
			signal: controller.signal,
		})
			.then((resp) => {
				if (!resp.ok) {
					throw new Error(resp.statusText);
				} else {
					return resp.json<R2Object>();
				}
			})
			.then((obj) => {
				if (!obj) {
					throw new Error('Object Not Found');
				} else {
					setData(obj);
				}
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error(err);
				setError(err.message);
			})
			.finally(() => setIsLoading(false));

		// eslint-disable-next-line consistent-return
		return () => {
			controller.abort();
		};
	}, [isPreviewActive, currentBucket, selectedObjects]);

	useEffect(() => {
		const onCloseModal = () => {
			dismissPreview();
			setData(null);
			setError(null);
		};

		const modalInstance = modal.current;

		modalInstance?.addEventListener('close', onCloseModal);

		return () => {
			modalInstance?.removeEventListener('close', onCloseModal);
		};
	}, [dismissPreview, modal]);

	useOnClickOutside(modalInner, () => modal.current?.close());

	const previewKey = selectedObjects.keys().next().value;

	return (
		<dialog
			ref={modal}
			className="z-20 w-full max-w-xl rounded-md border-1 border-secondary-dark/20 p-4 outline-none  backdrop:bg-secondary/30 dark:border-secondary/20 dark:backdrop:bg-secondary-dark/30"
		>
			<div className="flex flex-col items-center gap-2" ref={modalInner}>
				<div className="flex w-full flex-row justify-center">
					<h5>{previewKey?.replace(/.*\//, '')}</h5>

					<button type="button" onClick={() => modal.current?.close()}>
						<XCircle
							weight="bold"
							className="absolute right-2 top-2 h-4 w-4 text-secondary transition-colors hover:text-primary dark:text-secondary-dark hover:dark:text-primary-dark"
						/>
					</button>
				</div>

				{isLoading && <p>Loading...</p>}
				{error && <p className="text-status-error">{error}</p>}

				{previewKey && data?.httpMetadata?.contentType?.startsWith('image') && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={`/api/bucket/${currentBucket?.raw}${addLeadingSlash(previewKey)}`}
						alt={previewKey}
						className="max-h-[calc(100vh-10rem)] max-w-full"
					/>
				)}

				{previewKey && data?.httpMetadata?.contentType?.startsWith('video') && (
					// eslint-disable-next-line jsx-a11y/media-has-caption
					<video
						src={`/api/bucket/${currentBucket?.raw}${addLeadingSlash(previewKey)}`}
						controls
						className="max-h-[calc(100vh-10rem)] max-w-full"
					/>
				)}
			</div>
		</dialog>
	);
};
