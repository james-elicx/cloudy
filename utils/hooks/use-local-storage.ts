'use client';

import { useEffect, useRef, useState } from 'react';

export const useLocalStorage = <T extends Record<string, unknown>>(
	key: string,
	defaultValue: T,
) => {
	const gotInitialValue = useRef(false);
	const [value, setValue] = useState<T>({ __init: false, ...defaultValue });

	const keyRef = useRef(key);

	useEffect(() => {
		if (typeof localStorage === 'undefined') return;

		gotInitialValue.current = true;

		setValue((prevVal) => ({
			...prevVal,
			...(JSON.parse(localStorage?.getItem(keyRef.current) || '{}') as Partial<T>),
			__init: true,
		}));
	}, []);

	useEffect(() => {
		if (value === null || !value['__init']) return;

		localStorage.setItem(keyRef.current, JSON.stringify(value));
	}, [value]);

	return [value, setValue] as const;
};
