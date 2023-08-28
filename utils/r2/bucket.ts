import { binding } from 'cf-bindings-proxy';
import { notFound } from 'next/navigation';

export const getBucketsFromEnv = (): Record<string, R2Bucket> => {
	// In development, use `cf-bindings-proxy` to get the bucket.
	if (process.env.NODE_ENV === 'development') {
		return { 'cloudy-demo': binding<R2Bucket>('cloudy-demo') };
	}

	// In production, use the environment variables.
	return Object.entries(process.env).reduce(
		(acc, [key, value]) =>
			typeof value === 'object' && ['list', 'put', 'get'].every((m) => m in value)
				? { ...acc, [key]: value }
				: acc,
		{},
	);
};

export const getBucketFromEnv = (bucketName: string): R2Bucket | null | undefined => {
	const buckets = getBucketsFromEnv();
	return bucketName in buckets ? buckets[bucketName] : null;
};

export const validateBucketName = (bucketName?: string): void => {
	if (!(bucketName && !!getBucketFromEnv(bucketName))) {
		notFound();
	}
};

export const getBucketItems = async (
	bucketName: string,
	{ directory, cursor, limit }: { directory: string; cursor?: string; limit?: number },
): Promise<R2Objects> =>
	binding<R2Bucket>(bucketName).list({
		prefix: `${directory.replace(/^\/|\/$/g, '')}/`.replace(/\/\//g, '/').replace(/^\/$/, ''),
		delimiter: '/',
		cursor,
		limit,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - this is a bug in the cloudflare workers types
		include: ['httpMetadata', 'customMetadata'],
	});
