'use client';

import { useEffect, useRef, useState } from 'react';

export const useLocalStorage = <T extends Record<string, unknown>>(
	key: string,
	defaultValue: T,
) => {
	const [value, setValue] = useState<T>(defaultValue);

	const keyRef = useRef(key);

	useEffect(() => {
		if (typeof localStorage === 'undefined') return;

		setValue((prevVal) => ({
			...prevVal,
			...(JSON.parse(localStorage?.getItem(keyRef.current) || '{}') as Partial<T>),
		}));
	}, []);

	useEffect(() => {
		if (value === null) return;

		localStorage.setItem(keyRef.current, JSON.stringify(value));
	}, [value]);

	return [value, setValue] as const;
};
