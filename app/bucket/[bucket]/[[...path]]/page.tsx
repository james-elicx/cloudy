import { getBucketItems } from '@/utils/cf';
import { formatFullPath } from '@/utils';
import { ObjectExplorer } from '@/components';
import type { RouteParams } from './layout';

type Props = { params: RouteParams };

const Page = async ({ params: { bucket, path } }: Props) => {
	const fullPath = formatFullPath(path);
	const items = await getBucketItems(bucket, { directory: fullPath.join('/') });

	const objects = [...items.delimitedPrefixes, ...items.objects];

	return (
		<main className="mx-4 flex flex-grow flex-col justify-between">
			{items.delimitedPrefixes.length === 0 && items.objects.length === 0 ? (
				<span className="flex flex-grow items-center justify-center">No items found...</span>
			) : (
				<ObjectExplorer objects={objects} />
			)}
		</main>
	);
};

export default Page;
