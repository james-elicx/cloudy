import { getUserSession, isGlobalReadOnly } from '@/utils/auth';
import { getBucket } from '@/utils/cf';

export const runtime = 'edge';

export type FileInfo = {
	bucket: string;
	key: string;
	lastMod?: number;
};

export const PUT = async (
	req: Request,
	{ params: { bucket: bucketName } }: { params: { bucket: string } },
) => {
	if (isGlobalReadOnly()) {
		return new Response('Read only mode enabled', { status: 400 });
	}

	const bucket = await getBucket(bucketName, { needsWriteAccess: true });
	if (!bucket) {
		return new Response('Unable to modify bucket', { status: 400 });
	}

	const formData = await req.formData();
	for (const [rawFileInfo, file] of formData) {
		let fileInfo: FileInfo;
		try {
			const parsedInfo = JSON.parse(atob(rawFileInfo));
			if (
				typeof parsedInfo.bucket !== 'string' ||
				typeof parsedInfo.key !== 'string' ||
				parsedInfo.bucket !== bucketName
			) {
				throw new Error('Invalid bucket or key');
			}

			fileInfo = parsedInfo;
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to parse file destination';
			return new Response(msg, { status: 400 });
		}

		const session = await getUserSession();

		const customMetadata: Record<string, string> = {};

		if (fileInfo.lastMod) customMetadata['mtime'] = fileInfo.lastMod.toString();
		customMetadata['uploadedByUid'] = (session?.id ?? 0).toString(); // 0 = guest

		try {
			const asFile = file as unknown as File;
			const fileContents = await asFile.arrayBuffer();

			await bucket.put(fileInfo.key, fileContents, {
				httpMetadata: {
					contentType: asFile.type,
				},
				customMetadata,
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to upload file to bucket';
			return new Response(msg, { status: 400 });
		}
	}

	return new Response(null, { status: 200 });
};
