import { getUser } from '@/utils/auth';
import { q } from '@/utils/db';
import { notFound } from 'next/navigation';
import { getBucketsFromEnv } from '@/utils/cf';
import { updateVisibility } from '@/utils/actions/access-control';
import type { Metadata } from 'next';
import type { VisibilityTableRecord } from './visibility-table';
import { VisibilityTable } from './visibility-table';

export const metadata: Metadata = {
	title: 'Settings',
};

const Page = async (): Promise<JSX.Element> => {
	const user = await getUser();
	if (!user?.admin) return notFound();

	const records = await q.getVisibilityRecords();
	const buckets = getBucketsFromEnv();

	const allRecords = [
		...(records ?? []),
		...Object.keys(buckets)
			.filter((b) => !records?.find((r) => r.kind === 'r2' && r.key === b))
			.map(
				(b) =>
					({
						kind: 'r2',
						key: b,
						glob: '*',
						public: false,
						readOnly: true,
					}) satisfies VisibilityTableRecord,
			),
	];

	return (
		<div className="m-4 flex flex-col gap-2">
			<div className="flex flex-col">
				<span className="text-lg font-bold">Visibility Settings</span>
				<p className="text-sm">
					Control the visibility of your bindings, whether they are publically accessible, and the
					permissions allowed when public.
				</p>
			</div>

			<VisibilityTable records={allRecords} updateVisibilityAction={updateVisibility} />
			{allRecords.length === 0 && <span>No entries found</span>}
		</div>
	);
};

export default Page;
