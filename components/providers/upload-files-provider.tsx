'use client';

import { useXhr } from '@/utils/hooks';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { FileInfo } from '@/app/api/bucket/[bucket]/route';
import { useLocation } from './location-provider';

type FileWithDir = { dir: string; file: File };

export type IUploadFilesContext = {
	files: FileWithDir[];
	updateFiles: (newFiles: FileWithDir[]) => void;
	uploadFiles: () => void;
	error: string | null;
	progress: number;
	isDone: boolean;
	isUploading: boolean;
};

const UploadFilesContext = createContext<IUploadFilesContext>({
	files: [],
	updateFiles: () => {},
	uploadFiles: () => {},
	error: null,
	progress: 0,
	isDone: false,
	isUploading: false,
});

export const useUploadFiles = () => useContext(UploadFilesContext);

type Props = {
	children: React.ReactNode;
};

export const UploadFilesProvider = ({ children }: Props): JSX.Element => {
	const { currentBucket } = useLocation();
	const [files, setFiles] = useState<FileWithDir[]>([]);

	const { error, progress, isDone, isUploading, putFormData } = useXhr();

	const updateFiles = useCallback((newFiles: FileWithDir[]) => {
		setFiles(newFiles);
	}, []);

	const uploadFiles = useCallback(async () => {
		if (!currentBucket?.raw) return;

		const processedFiles = files.map(({ dir, file }) => {
			const key = `${dir}/${file.name}`.replace(/\/+/g, '/').replace(/^\//, '');
			const fileInfo: FileInfo = { bucket: currentBucket.raw, key, lastMod: file.lastModified };
			const fileInfoStr = btoa(JSON.stringify(fileInfo));

			return { key: fileInfoStr, value: file };
		});

		if (processedFiles.length) {
			putFormData(`/api/bucket/${currentBucket.raw}`, processedFiles);
		}
	}, [currentBucket, putFormData, files]);

	return (
		<UploadFilesContext.Provider
			value={useMemo(
				() => ({ files, updateFiles, uploadFiles, error, progress, isDone, isUploading }),
				[files, updateFiles, uploadFiles, error, progress, isDone, isUploading],
			)}
		>
			{children}
		</UploadFilesContext.Provider>
	);
};

export type { Props as UploadFilesProviderProps };
