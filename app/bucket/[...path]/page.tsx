/* eslint-disable no-console */
import { formatFullPath, getBucketItems } from '@/utils/r2';
import { BucketFilesTable } from '@/components';
import type { RouteParams } from './layout';

type Props = { params: RouteParams };

const Page = async ({ params: { path: fullPath } }: Props) => {
	const [bucketName, ...path] = formatFullPath(fullPath);
	const items = await getBucketItems(bucketName, { directory: path.join('/') });

	console.log(`/${path.join('/').replace(/^\/|\/$/g, '')}/`.replace(/\/\//g, '/'));
	console.log(JSON.stringify(items));

	return (
		<main className="mx-4 flex flex-grow flex-col justify-between">
			{items.delimitedPrefixes.length === 0 && items.objects.length === 0 ? (
				<span className="flex flex-grow items-center justify-center">No items found...</span>
			) : (
				<BucketFilesTable
					bucketName={bucketName}
					directories={items.delimitedPrefixes}
					files={items.objects}
				/>
			)}
		</main>
	);
};

export default Page;
