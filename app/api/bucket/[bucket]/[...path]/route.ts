import { getBucketFromEnv } from '@/utils/r2';

export const runtime = 'edge';

type Params = { bucket: string; path: string[] };

export const GET = async (
	_req: Request,
	{ params: { bucket: bucketName, path } }: { params: Params },
) => {
	const bucket = getBucketFromEnv(bucketName);
	if (!bucket) {
		return new Response('Failed to find bucket', { status: 400 });
	}

	const object = await bucket.get(`/${path.join('/')}`);

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);

	const buffer = await object.arrayBuffer();
	return new Response(buffer, { headers });
};

export const POST = async (
	_req: Request,
	{ params: { bucket: bucketName, path } }: { params: Params },
) => {
	const bucket = getBucketFromEnv(bucketName);
	if (!bucket) {
		return new Response('Failed to find bucket', { status: 400 });
	}

	const object = await bucket.head(`/${path.join('/')}`);

	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(JSON.stringify(object), { status: 200 });
};
