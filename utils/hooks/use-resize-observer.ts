'use client';

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useResizeObserver = (
	ref: RefObject<HTMLElement>,
	cb: (dims: { width: number; height: number }) => void,
) => {
	const cbRef = useRef(cb);
	const observer = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return undefined;

		if (!observer.current) {
			observer.current = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (!entry) return;

				const { width, height } = entry.contentRect;
				cbRef.current({ width, height });
			});
		}

		const instance = observer.current;

		instance.observe(el, { box: 'border-box' });

		return () => {
			if (instance) {
				instance.unobserve(el);
			}
		};
	}, [ref]);
};
