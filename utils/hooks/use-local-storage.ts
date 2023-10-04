'use client';

import { useEffect, useState } from 'react';

export const useLocalStorage = <T extends Record<string, unknown>>(
	key: string,
	defaultValue: T,
) => {
	const [value, setValue] = useState<T>(() => ({
		...defaultValue,
		...(JSON.parse(localStorage.getItem(key) || '{}') as Partial<T>),
	}));

	useEffect(() => {
		if (value != null) localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue] as const;
};
