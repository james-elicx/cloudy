'use client';

import { notFound } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ILocationContext = {
	buckets: string[];
	bucket: string | null;
	setBucket: (bucket: string) => void;
	location: string[];
	setLocation: (location: string[]) => void;
};

const LocationContext = createContext<ILocationContext>({
	buckets: [],
	bucket: null,
	setBucket: () => {},
	location: [],
	setLocation: () => {},
});

export const useLocation = () => useContext(LocationContext);

type Props = {
	buckets: string[];
	children: React.ReactNode;
};

export const LocationProvider = ({ buckets: passedBuckets, children }: Props): JSX.Element => {
	const buckets = useMemo<string[]>(() => passedBuckets, [passedBuckets]);

	const [activeBucket, setActiveBucket] = useState<string | null>(null);
	const [location, setLocation] = useState<string[]>([]);

	const setBucket = useCallback(
		(bucketName: string) => {
			if (buckets.includes(bucketName)) {
				setActiveBucket(bucketName);
			} else {
				notFound();
			}
		},
		[buckets],
	);

	return (
		<LocationContext.Provider
			value={useMemo(
				() => ({ buckets, bucket: activeBucket, setBucket, location, setLocation }),
				[activeBucket, buckets, location, setBucket],
			)}
		>
			{children}
		</LocationContext.Provider>
	);
};

export type { Props as LocationProviderProps };

export const addLeadingSlash = (path: string): string => (path.startsWith('/') ? path : `/${path}`);
export const addTrailingSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`);
