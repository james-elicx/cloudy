'use client';

import { Door, DoorOpen } from '../icons';
import { useObjectExplorer } from '../providers';
import { useSettings } from '../providers/settings-provider';
import { ObjectPreviewInner } from './object-preview-inner';

export const PreviewPane = () => {
	const { isPreviewPaneActive } = useSettings();
	const { objects, selectedObjects } = useObjectExplorer();

	if (!isPreviewPaneActive) {
		return null;
	}

	const item =
		selectedObjects.size === 1
			? objects?.find((obj) => obj.path === selectedObjects.keys().next().value)
			: undefined;

	const currentName =
		selectedObjects.size > 1 ? 'Multiple items selected' : item?.getName() ?? 'Nothing selected';

	return (
		<div className="flex h-full w-full min-w-[16rem] max-w-[16rem] flex-col overflow-y-auto">
			<div className="flex flex-grow flex-col" id="preview-pane">
				<div className="flex h-9 flex-row items-center">
					<span className="truncate font-medium" title={currentName}>
						{currentName}
					</span>
				</div>

				<div className="relative flex h-full max-h-[16rem] w-full items-center justify-center overflow-hidden rounded-md bg-secondary/30 dark:bg-secondary-dark/30">
					{item && <ObjectPreviewInner path={item.path} type={item.getType()} />}
				</div>

				{item && (
					<div className="mt-2 grid grid-cols-2 gap-1 text-sm">
						<span className="text-sm font-medium">Content Type</span>
						<span>{item.rawType}</span>
						<span className="text-sm font-medium">Size</span>
						<span>{item.getSize()}</span>
						<span className="text-sm font-medium">Last Modified</span>
						<span>{item.getLastModified()?.toLocaleDateString() ?? ''}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export const TogglePreviewPaneButton = () => {
	const { isPreviewPaneActive, togglePreviewPane } = useSettings();

	return (
		<button
			type="button"
			title={`${isPreviewPaneActive ? 'Hide' : 'Show'} Preview Pane`}
			className="text-primary transition-all hover:text-accent dark:text-primary-dark dark:hover:text-accent-dark"
			onClick={() => togglePreviewPane()}
		>
			{isPreviewPaneActive ? (
				<Door weight="bold" className="h-5 w-5" />
			) : (
				<DoorOpen weight="bold" className="h-5 w-5" />
			)}
		</button>
	);
};
