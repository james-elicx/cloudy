'use client';

import { formatBucketName } from '@/utils';
import { notFound } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Bucket = { raw: string; parsed: string };
export type ILocationContext = {
	buckets: Bucket[];
	currentBucket: Bucket | null;
	setBucket: (bucket: string) => void;
	location: string[];
	setLocation: (location: string[]) => void;
};

const LocationContext = createContext<ILocationContext>({
	buckets: [],
	currentBucket: null,
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
	const buckets = useMemo<Bucket[]>(
		() => passedBuckets.map((b) => ({ raw: b, parsed: formatBucketName(b) })),
		[passedBuckets],
	);

	const [currentBucket, setCurrentBucket] = useState<Bucket | null>(null);
	const [location, setLocation] = useState<string[]>([]);

	const setBucket = useCallback(
		(bucketName: string) => {
			const foundBucket = buckets.find((b) => b.raw === bucketName);

			if (foundBucket) {
				setCurrentBucket(foundBucket);
			} else {
				notFound();
			}
		},
		[buckets],
	);

	return (
		<LocationContext.Provider
			value={useMemo(
				() => ({ buckets, currentBucket, setBucket, location, setLocation }),
				[currentBucket, buckets, location, setBucket],
			)}
		>
			{children}
		</LocationContext.Provider>
	);
};

export type { Props as LocationProviderProps };
