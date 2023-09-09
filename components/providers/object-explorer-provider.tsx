'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocation } from './location-provider';

type UpdateObjectsOpts = { clear?: boolean; cursor?: string };

type ObjectItem = R2Object | string;

export type IObjectExplorerContext = {
	objects: ObjectItem[] | undefined;
	updateObjects: (newObjects: ObjectItem[], opts?: UpdateObjectsOpts) => void;
	tryFetchMoreObjects: () => void;
	selectedObjects: Set<string>;
	addSelectedObject: (key: string, shouldClear?: boolean) => void;
	removeSelectedObject: (key: string) => void;
	clearSelectedObjects: () => void;
};

const ObjectExplorerContext = createContext<IObjectExplorerContext>({
	objects: [],
	updateObjects: () => {},
	tryFetchMoreObjects: () => {},
	selectedObjects: new Set(),
	addSelectedObject: () => {},
	removeSelectedObject: () => {},
	clearSelectedObjects: () => {},
});

export const useObjectExplorer = () => useContext(ObjectExplorerContext);

type Props = {
	children: React.ReactNode;
};

export const ObjectExplorerProvider = ({ children }: Props): JSX.Element => {
	const { currentBucket, location } = useLocation();
	const [objects, setObjects] = useState<ObjectItem[] | undefined>(undefined);
	const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());

	const [, setIsFetchingMoreObjects] = useState<boolean>(false);
	const isFetchingMoreObjectsRef = useRef<boolean>(false);
	const fetchObjectsCursor = useRef<string | null>();

	const updateObjects = useCallback((newObjects: ObjectItem[], opts: UpdateObjectsOpts = {}) => {
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
				updateObjects([...data.delimitedPrefixes, ...data.objects], {
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
		(key: string, shouldClear?: boolean) => {
			if (shouldClear) {
				setSelectedObjects(new Set([key]));
			} else {
				selectedObjects.add(key);
				setSelectedObjects(new Set(selectedObjects));
			}
		},
		[selectedObjects],
	);

	const removeSelectedObject = useCallback(
		(key: string) => {
			selectedObjects.delete(key);
			setSelectedObjects(new Set(selectedObjects));
		},
		[selectedObjects],
	);

	const clearSelectedObjects = useCallback(() => setSelectedObjects(new Set()), []);

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
				}),
				[
					objects,
					updateObjects,
					tryFetchMoreObjects,
					addSelectedObject,
					removeSelectedObject,
					selectedObjects,
					clearSelectedObjects,
				],
			)}
		>
			{children}
		</ObjectExplorerContext.Provider>
	);
};

export type { Props as ObjectExplorerProviderProps };
