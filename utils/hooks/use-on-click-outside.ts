'use client';

import { useEffect, useRef } from 'react';

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
	ref: React.RefObject<T>,
	handler: (e: MouseEvent) => void,
	disable = false,
) => {
	const disableRef = useRef(disable);
	useEffect(() => {
		disableRef.current = disable;
	}, [disable]);

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (!disableRef.current && ref.current && !ref.current.contains(e.target as Node)) {
				handler(e);
			}
		};

		document.addEventListener('mousedown', onClick);

		return () => {
			document.removeEventListener('mousedown', onClick);
		};
	});
};
