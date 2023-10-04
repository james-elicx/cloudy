'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { FileObject } from '@/utils/file-object';
import { useRouter } from 'next/navigation';
import { useObjectExplorer } from './object-explorer-provider';
import { useLocation } from './location-provider';

export type IExplorerEventsContext = {
	handleDoubleClick: (object: Pick<FileObject, 'isDirectory' | 'path'>) => void;
};

const ExplorerEventsContext = createContext<IExplorerEventsContext>({
	handleDoubleClick: () => {},
});

export const useExplorerEvents = () => useContext(ExplorerEventsContext);

type Props = {
	children: React.ReactNode;
};

export const ExplorerEventsProvider = ({ children }: Props): JSX.Element => {
	const router = useRouter();
	const { currentBucket } = useLocation();

	const { triggerPreview } = useObjectExplorer();

	const handleDoubleClick = useCallback(
		(object: Pick<FileObject, 'isDirectory' | 'path'>) => {
			if (object.isDirectory) {
				router.push(`/bucket/${currentBucket?.raw}/${object.path}`);
			} else {
				triggerPreview();
			}
		},
		[router, currentBucket?.raw, triggerPreview],
	);

	return (
		<ExplorerEventsContext.Provider
			value={useMemo(() => ({ handleDoubleClick }), [handleDoubleClick])}
		>
			{children}
		</ExplorerEventsContext.Provider>
	);
};

export type { Props as ExplorerEventsProviderProps };
