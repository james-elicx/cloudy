import { Header } from '@/components';
import { getSettingsRecords } from '@/utils/db/queries';
import { updateCacheHeader } from '@/utils/actions/settings';
import { SettingsGrid } from './settings-grid';

const Page = async (): Promise<JSX.Element> => {
	const settings = await getSettingsRecords('general');

	return (
		<div className="flex flex-col gap-2">
			<Header
				title="General Settings"
				desc="Specify general configuation options for your Cloudy instance."
			/>

			<SettingsGrid settings={settings} updateCacheHeaderAction={updateCacheHeader} />
		</div>
	);
};

export default Page;
