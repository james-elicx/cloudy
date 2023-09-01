'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

export const useXhr = () => {
	const xhrRef = useRef<{ xhr: XMLHttpRequest; cleanup: () => void } | null>(null);

	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [isDone, setIsDone] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createXhr = useCallback(() => {
		if (xhrRef.current) {
			xhrRef.current.cleanup();
		}

		const xhr = new XMLHttpRequest();

		setProgress(0);
		setIsUploading(false);
		setIsDone(false);
		setError(null);

		const onProgress = ({ loaded, total }: ProgressEvent) =>
			setProgress(Math.round((loaded / total) * 100));
		const onLoad = () => {
			setIsUploading(false);
			setProgress(0);
		};
		const onError = () => {
			setIsUploading(false);
			setError('An error occurred while uploading the blob');
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

			if (xhr.status !== 200) {
				const resp = xhr.responseText;
				setError(resp || 'An error occurred while uploading the blob');
			} else {
				setProgress(100);
			}
		};

		xhr.upload?.addEventListener('progress', onProgress);
		xhr.addEventListener('load', onLoad);
		xhr.addEventListener('loadstart', onStart);
		xhr.addEventListener('loadend', onDone);
		xhr.addEventListener('error', onError);
		xhr.addEventListener('abort', onAbort);

		const cleanup = () => {
			xhr.upload?.removeEventListener('progress', onProgress);
			xhr.removeEventListener('load', onLoad);
			xhr.removeEventListener('loadend', onDone);
			xhr.removeEventListener('loadstart', onStart);
			xhr.removeEventListener('error', onError);
			xhr.removeEventListener('abort', onAbort);
		};

		xhrRef.current = { xhr, cleanup };
	}, []);

	useEffect(() => {
		const xhr = xhrRef.current;
		if (!xhr) return undefined;

		// ensure we remove the event listeners
		return () => xhr.cleanup();
	}, []);

	const putFormData = useCallback(
		async (path: string, data: { key: string; value: string | Blob }[]) => {
			createXhr();
			const xhr = xhrRef.current?.xhr as XMLHttpRequest;

			xhr.open('PUT', path);

			const formData = new FormData();
			data.forEach(({ key, value }) => formData.append(key, value));

			xhr.send(formData);
		},
		[createXhr],
	);

	return useMemo(
		() => ({ progress, isUploading, isDone, error, putFormData }),
		[progress, isUploading, isDone, error, putFormData],
	);
};
