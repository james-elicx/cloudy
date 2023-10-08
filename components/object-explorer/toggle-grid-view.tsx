import { GridFour, List } from '../icons';
import { useSettings } from '../providers';

export const ToggleGridViewButton = (): JSX.Element => {
	const { isGridView, toggleGridView } = useSettings();

	const Icon = isGridView ? List : GridFour;

	return (
		<button
			type="button"
			title={isGridView ? 'List View' : 'Grid View'}
			className="text-primary transition-all hover:text-accent dark:text-primary-dark dark:hover:text-accent-dark"
			onClick={() => toggleGridView()}
		>
			<Icon weight="bold" className="h-5 w-5" />
		</button>
	);
};
