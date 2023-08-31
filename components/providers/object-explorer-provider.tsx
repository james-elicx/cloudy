'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type IObjectExplorerContext = {
	selectedObjects: Set<string>;
	addSelectedObject: (key: string, shouldClear?: boolean) => void;
	removeSelectedObject: (key: string) => void;
	clearSelectedObjects: () => void;
};

const ObjectExplorerContext = createContext<IObjectExplorerContext>({
	selectedObjects: new Set<string>(),
	addSelectedObject: () => {},
	removeSelectedObject: () => {},
	clearSelectedObjects: () => {},
});

export const useObjectExplorer = () => useContext(ObjectExplorerContext);

type Props = {
	children: React.ReactNode;
};

export const ObjectExplorerProvider = ({ children }: Props): JSX.Element => {
	const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set<string>());

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

	const clearSelectedObjects = useCallback(() => setSelectedObjects(new Set<string>()), []);

	return (
		<ObjectExplorerContext.Provider
			value={useMemo(
				() => ({ selectedObjects, addSelectedObject, removeSelectedObject, clearSelectedObjects }),
				[addSelectedObject, removeSelectedObject, selectedObjects, clearSelectedObjects],
			)}
		>
			{children}
		</ObjectExplorerContext.Provider>
	);
};

export type { Props as ObjectExplorerProviderProps };
