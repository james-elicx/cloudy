'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { rawToObjs, type FileObject } from '@/utils';
import { useLocation } from './location-provider';

type UpdateObjectsOpts = { clear?: boolean; cursor?: string };

export type IObjectExplorerContext = {
	objects: FileObject[] | undefined;
	updateObjects: (newObjects: FileObject[], opts?: UpdateObjectsOpts) => void;
	tryFetchMoreObjects: () => void;
	selectedObjects: Map<string, { idx: number }>;
	addSelectedObject: (key: string, objInfo: { idx: number }, shouldClear?: boolean) => void;
	removeSelectedObject: (key: string) => void;
	clearSelectedObjects: () => void;
	isPreviewActive: boolean;
	triggerPreview: () => void;
	dismissPreview: () => void;
};

const ObjectExplorerContext = createContext<IObjectExplorerContext>({
	objects: [],
	updateObjects: () => {},
	tryFetchMoreObjects: () => {},
	selectedObjects: new Map(),
	addSelectedObject: () => {},
	removeSelectedObject: () => {},
	clearSelectedObjects: () => {},
	isPreviewActive: false,
	triggerPreview: () => {},
	dismissPreview: () => {},
});

export const useObjectExplorer = () => useContext(ObjectExplorerContext);

type Props = {
	children: React.ReactNode;
};

export const ObjectExplorerProvider = ({ children }: Props): JSX.Element => {
	const { currentBucket, location } = useLocation();
	const [objects, setObjects] = useState<FileObject[] | undefined>(undefined);
	const [selectedObjects, setSelectedObjects] = useState<Map<string, { idx: number }>>(new Map());

	const [, setIsFetchingMoreObjects] = useState<boolean>(false);
	const isFetchingMoreObjectsRef = useRef<boolean>(false);
	const fetchObjectsCursor = useRef<string | null>();

	const updateObjects = useCallback((newObjects: FileObject[], opts: UpdateObjectsOpts = {}) => {
		if (opts.clear) {
			fetchObjectsCursor.current = null;
			setObjects(newObjects);
		} else {
			setObjects((prevObjects) => (prevObjects ?? []).concat(newObjects));
		}

		fetchObjectsCursor.current = opts.cursor ?? null;
	}, []);

	const tryFetchMoreObjects = useCallback(() => {
		if (!fetchObjectsCursor.current || !currentBucket) return undefined;
		if (isFetchingMoreObjectsRef.current) return undefined;

		isFetchingMoreObjectsRef.current = true;
		setIsFetchingMoreObjects(true);

		const searchParams = new URLSearchParams({
			cursor: fetchObjectsCursor.current,
			dir: location.join('/'),
		});

		return fetch(`/api/bucket/${currentBucket.raw}?${searchParams.toString()}`)
			.then((resp) => {
				if (resp.status !== 200) {
					throw new Error(`Failed to fetch more objects: ${resp.statusText}`);
				}
				return resp.json<R2Objects>();
			})
			.then((data) => {
				updateObjects(rawToObjs(data.delimitedPrefixes).concat(rawToObjs(data.objects)), {
					cursor: data.truncated ? data.cursor : undefined,
				});
			})
			.catch((err) => {
				// TODO: Change to a toast.
				// eslint-disable-next-line no-console
				console.error(err);
				// eslint-disable-next-line no-alert
				alert(err instanceof Error ? err.message : 'Failed to fetch more objects');
			})
			.finally(() => {
				isFetchingMoreObjectsRef.current = false;
				setIsFetchingMoreObjects(false);
			});
	}, [currentBucket, location, updateObjects]);

	const addSelectedObject = useCallback(
		(key: string, objInfo: { idx: number }, shouldClear?: boolean) => {
			if (shouldClear) {
				if (selectedObjects.size > 1 || !selectedObjects.has(key)) {
					setSelectedObjects(new Map([[key, objInfo]]));
				}
			} else if (!selectedObjects.has(key)) {
				selectedObjects.set(key, objInfo);
				setSelectedObjects(new Map(selectedObjects));
			}
		},
		[selectedObjects],
	);

	const removeSelectedObject = useCallback(
		(key: string) => {
			selectedObjects.delete(key);
			setSelectedObjects(new Map(selectedObjects));
		},
		[selectedObjects],
	);

	const clearSelectedObjects = useCallback(() => setSelectedObjects(new Map()), []);

	const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
	const triggerPreview = useCallback(() => setIsPreviewActive(true), []);
	const dismissPreview = useCallback(() => setIsPreviewActive(false), []);

	return (
		<ObjectExplorerContext.Provider
			value={useMemo(
				() => ({
					objects,
					updateObjects,
					tryFetchMoreObjects,
					selectedObjects,
					addSelectedObject,
					removeSelectedObject,
					clearSelectedObjects,
					isPreviewActive,
					triggerPreview,
					dismissPreview,
				}),
				[
					objects,
					updateObjects,
					tryFetchMoreObjects,
					addSelectedObject,
					removeSelectedObject,
					selectedObjects,
					clearSelectedObjects,
					isPreviewActive,
					triggerPreview,
					dismissPreview,
				],
			)}
		>
			{children}
		</ObjectExplorerContext.Provider>
	);
};

export type { Props as ObjectExplorerProviderProps };
