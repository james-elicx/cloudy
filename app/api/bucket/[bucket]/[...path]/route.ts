import { getBucket } from '@/utils/cf';
import { getSettingsRecord } from '@/utils/db/queries';

export const runtime = 'edge';

type Params = { bucket: string; path: string[] };

export const GET = async (
	_req: Request,
	{ params: { bucket: bucketName, path } }: { params: Params },
) => {
	const bucket = await getBucket(bucketName);
	if (!bucket) {
		return new Response('Unable to read bucket', { status: 400 });
	}

	const object = await bucket.get(path.join('/'));

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	const cacheControlSetting = await getSettingsRecord('cache-header');

	const headers = new Headers();

	if (cacheControlSetting) {
		headers.set('cache-control', cacheControlSetting.value);
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

	headers.set('etag', object.httpEtag);

	// TODO: Something broke with object.body here.
	return new Response(await object.arrayBuffer(), { headers });
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
