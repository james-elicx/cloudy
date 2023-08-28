'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type SortField = 'name' | 'type' | 'size' | 'lastModified';
export type SortOrder = 'asc' | 'desc';
export type SortInfo = { field: SortField; order: SortOrder };

type ISortableFilesContext = {
	sort: SortInfo;
	setSort: React.Dispatch<React.SetStateAction<SortInfo>>;
	sortObjects: (
		objects: R2Object[] | string[],
		field: SortField,
		order: SortOrder,
	) => R2Object[] | string[];
};

const SortableFilesContext = createContext<ISortableFilesContext>({
	sort: { field: 'name', order: 'asc' },
	setSort: () => {},
	sortObjects: () => [],
});

export const useSortableFiles = () => useContext(SortableFilesContext);

export const SortableFilesProvider = ({ children }: { children: React.ReactNode }) => {
	const [sort, setSort] = useState<SortInfo>({ field: 'name', order: 'asc' });

	const sortObjects = useCallback(
		(objects: R2Object[] | string[], field: SortField, order: SortOrder) => {
			if (objects.length === 0) return objects;

			// For string arrays, sort by name only.
			if (typeof objects[0] === 'string') {
				return field === 'name'
					? objects
					: (objects as string[]).sort((a, b) =>
							order === 'asc' ? a.localeCompare(b) : b.localeCompare(a),
					  );
			}

			const asR2Objects = objects as R2Object[];

			switch (field) {
				case 'name':
					return asR2Objects.sort((a, b) =>
						order === 'asc' ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key),
					);
				case 'size':
					return asR2Objects.sort((a, b) => (order === 'asc' ? a.size - b.size : b.size - a.size));
				case 'type':
					return asR2Objects.sort((a, b) => {
						const aVal = a.httpMetadata?.contentType ?? 'unknown';
						const bVal = b.httpMetadata?.contentType ?? 'unknown';

						return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
					});
				case 'lastModified':
					return asR2Objects.sort((a, b) => {
						const aVal = a.customMetadata?.['mtime'] ?? '0';
						const bVal = b.customMetadata?.['mtime'] ?? '0';

						return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
					});
				default:
					return asR2Objects;
			}
		},
		[],
	);

	return (
		<SortableFilesContext.Provider
			value={useMemo(() => ({ sort, setSort, sortObjects }), [sort, setSort, sortObjects])}
		>
			{children}
		</SortableFilesContext.Provider>
	);
};
