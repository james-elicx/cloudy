import { getBucket } from '@/utils/cf';
import { getSettingsRecord } from '@/utils/db/queries';

export const runtime = 'edge';

type Params = { bucket: string; path: string[] };

export const GET = async (
	req: Request,
	{ params: { bucket: bucketName, path } }: { params: Params },
) => {
	const bucket = await getBucket(bucketName);
	if (!bucket) {
		return new Response('Unable to read bucket', { status: 400 });
	}

	const [, start, end] = /^bytes=(\d+)-(\d+)?$/.exec(req.headers.get('range') ?? '') ?? [];

	const object = await bucket.get(path.join('/'), {
		...(start && { range: { offset: Number(start), length: end ? Number(end) : undefined } }),
	});

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	const cacheControlSetting = await getSettingsRecord('cache-header');

	const headers = new Headers();

	if (cacheControlSetting) {
		headers.set('cache-control', cacheControlSetting.value);
	}

	if (start && object.range && 'offset' in object.range && object.range.offset !== undefined) {
		headers.set(
			'content-range',
			`bytes ${object.range.offset}-${
				object.range.length
					? Math.min(object.range.offset + object.range.length, object.size - 1)
					: object.size
			}/${object.size}`,
		);
	}

	// object.writeHttpMetadata does not work properly with Miniflare in next dev
	if (object.httpMetadata?.contentDisposition)
		headers.set('content-disposition', object.httpMetadata?.contentDisposition);
	if (object.httpMetadata?.contentEncoding)
		headers.set('content-encoding', object.httpMetadata?.contentEncoding);
	if (object.httpMetadata?.contentLanguage)
		headers.set('content-language', object.httpMetadata?.contentLanguage);
	if (object.httpMetadata?.contentType)
		headers.set('content-type', object.httpMetadata?.contentType);
	if (object.httpMetadata?.contentType?.startsWith('video')) headers.set('accept-ranges', 'bytes');

	headers.set('etag', object.httpEtag);

	return new Response(object.body, {
		headers,
		status: start !== undefined ? 206 : 200,
	});
};

export const POST = async (
	_req: Request,
	{ params: { bucket: bucketName, path } }: { params: Params },
) => {
	const bucket = await getBucket(bucketName);
	if (!bucket) {
		return new Response('Unable to read bucket', { status: 400 });
	}

	const object = await bucket.head(path.join('/'));

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(JSON.stringify(object), { status: 200 });
};
