import { getBucketItems } from '@/utils/cf';
import { formatFullPath } from '@/utils';
import { FilesTables } from '@/components';
import type { RouteParams } from './layout';

type Props = { params: RouteParams };

const Page = async ({ params: { path: fullPath } }: Props) => {
	const [bucketName, ...path] = formatFullPath(fullPath);
	const items = await getBucketItems(bucketName, { directory: path.join('/') });

	return (
		<main className="mx-4 flex flex-grow flex-col justify-between">
			{items.delimitedPrefixes.length === 0 && items.objects.length === 0 ? (
				<span className="flex flex-grow items-center justify-center">No items found...</span>
			) : (
				<FilesTables directories={items.delimitedPrefixes} files={items.objects} />
			)}
		</main>
	);
};

export default Page;
