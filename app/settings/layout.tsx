import { getUser } from '@/utils/auth';
import { notFound } from 'next/navigation';
import { TabGroup } from '@/components';

type Props = { children: React.ReactNode };

const Layout = async ({ children }: Props): Promise<JSX.Element> => {
	const user = await getUser();
	if (!user?.admin) return notFound();

	return (
		<div className="mx-4 my-4 flex flex-col gap-2">
			<TabGroup
				tabs={[
					{ label: 'General', href: '/settings', exactMatch: true },
					{ label: 'Visibility', href: '/settings/visibility' },
				]}
			/>

			{children}
		</div>
	);
};

export default Layout;
