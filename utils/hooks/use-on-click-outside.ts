'use client';

import { useEffect, useRef } from 'react';

export const useOnClickOutside = (
	ref: React.RefObject<HTMLElement> | React.RefObject<HTMLElement>[],
	handler: (e: MouseEvent) => void,
	disable = false,
) => {
	const disableRef = useRef(disable);
	useEffect(() => {
		disableRef.current = disable;
	}, [disable]);

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (
				!disableRef.current &&
				(Array.isArray(ref) ? ref : [ref]).every(
					(r) => r.current && !r.current.contains(e.target as Node),
				)
			) {
				handler(e);
			}
		};

		document.addEventListener('mousedown', onClick);

		return () => {
			document.removeEventListener('mousedown', onClick);
		};
	});
};
