'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { FileObject } from '@/utils/file-object';
import { useRouter } from 'next/navigation';
import { useObjectExplorer } from './object-explorer-provider';
import { useLocation } from './location-provider';
import { useFilePreview } from './file-preview-provider';

export type IExplorerEventsContext = {
	handleMouseDown: (e: React.MouseEvent<HTMLElement>, object: FileObject) => void;
	handleDoubleClick: (object: Pick<FileObject, 'isDirectory' | 'path'>) => void;
	handleContextMenu: (object: FileObject) => void;
};

const ExplorerEventsContext = createContext<IExplorerEventsContext>({
	handleMouseDown: () => {},
	handleDoubleClick: () => {},
	handleContextMenu: () => {},
});

export const useExplorerEvents = () => useContext(ExplorerEventsContext);

type Props = {
	children: React.ReactNode;
};

export const ExplorerEventsProvider = ({ children }: Props): JSX.Element => {
	const router = useRouter();
	const { currentBucket } = useLocation();

	const { addSelectedObject } = useObjectExplorer();
	const { triggerFilePreview } = useFilePreview();

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLElement>, object: FileObject) => {
			// We only trigger selection on left click.
			// `onMouseDown` is used instead of `onClick` so we can mark an object as selected on focusing instead of after the click completes.
			if (e.button !== 0) return;

			if (e.ctrlKey) {
				addSelectedObject(object.path);
			} else {
				addSelectedObject(object.path, true);
			}
		},
		[addSelectedObject],
	);

	const handleDoubleClick = useCallback(
		(object: Pick<FileObject, 'isDirectory' | 'path'>) => {
			if (object.isDirectory) {
				router.push(`/bucket/${currentBucket?.raw}/${object.path}`);
			} else {
				triggerFilePreview(object.path);
			}
		},
		[triggerFilePreview, router, currentBucket],
	);

	const handleContextMenu = useCallback(
		(object: FileObject) => {
			addSelectedObject(object.path, true);
			// TODO: Render a context menu.
		},
		[addSelectedObject],
	);

	return (
		<ExplorerEventsContext.Provider
			value={useMemo(
				() => ({ handleMouseDown, handleDoubleClick, handleContextMenu }),
				[handleMouseDown, handleDoubleClick, handleContextMenu],
			)}
		>
			{children}
		</ExplorerEventsContext.Provider>
	);
};

export type { Props as ExplorerEventsProviderProps };
