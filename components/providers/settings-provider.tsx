'use client';

import { useLocalStorage } from '@/utils/hooks/use-local-storage';
import { createContext, useCallback, useContext, useMemo } from 'react';

export type ISettingsContext = {
	isPreviewPaneActive: boolean;
	togglePreviewPane: () => void;
	isGridView: boolean;
	toggleGridView: () => void;
};

const SettingsContext = createContext<ISettingsContext>({
	isPreviewPaneActive: true,
	togglePreviewPane: () => {},
	isGridView: false,
	toggleGridView: () => {},
});

export const useSettings = () => useContext(SettingsContext);

type Props = {
	children: React.ReactNode;
};

type Settings = {
	isPreviewPaneActive: boolean;
	isGridView: boolean;
};

// TODO: Store authed user settings in the database?

export const SettingsProvider = ({ children }: Props): JSX.Element => {
	const [{ isPreviewPaneActive, isGridView }, setSettings] = useLocalStorage<Settings>(
		'cloudy-settings',
		{ isPreviewPaneActive: true, isGridView: false },
	);

	const toggleSetting = useCallback(
		(key: keyof Settings) => {
			setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
		},
		[setSettings],
	);

	const togglePreviewPane = useCallback(
		() => toggleSetting('isPreviewPaneActive'),
		[toggleSetting],
	);

	const toggleGridView = useCallback(() => toggleSetting('isGridView'), [toggleSetting]);

	return (
		<SettingsContext.Provider
			value={useMemo(
				() => ({ isPreviewPaneActive, togglePreviewPane, isGridView, toggleGridView }),
				[isPreviewPaneActive, togglePreviewPane, isGridView, toggleGridView],
			)}
		>
			{children}
		</SettingsContext.Provider>
	);
};

export type { Props as SettingsProviderProps };
