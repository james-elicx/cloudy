'use client';

import { useLocation } from '@/components';
import { useEffect } from 'react';

export const Ctx = ({ bucketName, path }: { bucketName: string; path: string[] }): JSX.Element => {
	const { setBucket, setLocation } = useLocation();

	useEffect(() => setBucket(bucketName), [bucketName, setBucket]);
	useEffect(() => setLocation(path), [path, setLocation]);

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <></>;
};
