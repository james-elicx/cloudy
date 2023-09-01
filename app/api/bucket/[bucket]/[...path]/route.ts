import { getBucket } from '@/utils/cf';

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

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);

	return new Response(object.body, { headers });
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
