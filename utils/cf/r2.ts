import { cache } from 'react';
import { getUser, isAuthAvailable } from '../auth';
import { q } from '../db';

export const getBucketsFromEnv = (): Record<string, R2Bucket> =>
	Object.entries(process.env).reduce(
		(acc, [key, value]) =>
			key !== 'ASSETS' &&
			typeof value === 'object' &&
			['list', 'put', 'get'].every((m) => m in value)
				? { ...acc, [key]: value }
				: acc,
		{},
	);

const getBucketFromEnv = (bucketName: string): R2Bucket | null | undefined => {
	const buckets = getBucketsFromEnv();
	return bucketName in buckets ? buckets[bucketName] : null;
};

export const getBucketItems = async (
	bucketName: string,
	{ directory, cursor, limit }: { directory: string; cursor?: string; limit?: number },
): Promise<R2Objects> =>
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	getBucketFromEnv(bucketName)!.list({
		prefix: `${directory.replace(/^\/|\/$/g, '')}/`.replace(/\/\//g, '/').replace(/^\/$/, ''),
		delimiter: '/',
		cursor,
		limit,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - this is a bug in the cloudflare workers types
		include: ['httpMetadata', 'customMetadata'],
	});

export const getBuckets = cache(async (opts: BucketOpts = {}) => {
	const bucketsFromEnv = Object.keys(getBucketsFromEnv());
	if (!isAuthAvailable()) return bucketsFromEnv;

	const user = await getUser();
	const buckets = await q.getVisibilityRecords({
		kind: 'r2',
		publicOnly: !user?.admin,
		readOnly: opts.needsWriteAccess ? false : undefined,
	});
	const bucketKeys = (buckets ?? []).map((b) => b.key);

	const allBuckets = user?.admin ? [...bucketKeys, ...bucketsFromEnv] : bucketKeys;

	return [...new Set(allBuckets)];
});

export const validateBucketName = cache(async (bucketName?: string, opts: BucketOpts = {}) => {
	if (!bucketName) return false;

	const buckets = await getBuckets(opts);

	return buckets.includes(bucketName);
});

export const getBucket = async (bucketName?: string, opts: BucketOpts = {}) => {
	const isValidBucket = bucketName && (await validateBucketName(bucketName, opts));

	if (isValidBucket) {
		return getBucketFromEnv(bucketName);
	}

	return null;
};

type BucketOpts = {
	needsWriteAccess?: boolean;
};
