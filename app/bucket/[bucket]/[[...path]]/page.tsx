import { getBucketItems } from '@/utils/cf';
import { formatFullPath } from '@/utils';
import { ObjectExplorer, PreviewPane } from '@/components';
import type { RouteParams } from './layout';

type Props = { params: RouteParams };

const Page = async ({ params: { bucket, path } }: Props) => {
	const fullPath = formatFullPath(path);
	const items = await getBucketItems(bucket, { directory: fullPath.join('/') });

	const objects = [...items.delimitedPrefixes, ...items.objects].map(
		// Miniflare returns a class for R2Object in next dev which client components cannot receive as props.
		(o): R2Object | string => JSON.parse(JSON.stringify(o)),
	);

	return (
		<main className="flex h-full max-h-[calc(100%-4rem)] w-full max-w-[calc(100vw-16rem)] flex-row justify-between gap-4 px-4">
			{items.delimitedPrefixes.length === 0 && items.objects.length === 0 ? (
				<span className="flex flex-grow items-center justify-center">No items found...</span>
			) : (
				<ObjectExplorer
					initialObjects={objects}
					initialCursor={items.truncated ? items.cursor : undefined}
				/>
			)}

			<PreviewPane />
		</main>
	);
};

export default Page;
