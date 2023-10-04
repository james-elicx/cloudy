'use client';

import { useLocalStorage } from '@/utils/hooks/use-local-storage';
import { createContext, useCallback, useContext, useMemo } from 'react';

export type ISettingsContext = {
	isPreviewPaneActive: boolean;
	togglePreviewPane: () => void;
};

const SettingsContext = createContext<ISettingsContext>({
	isPreviewPaneActive: true,
	togglePreviewPane: () => {},
});

export const useSettings = () => useContext(SettingsContext);

type Props = {
	children: React.ReactNode;
};

type Settings = {
	isPreviewPaneActive: boolean;
};

export const SettingsProvider = ({ children }: Props): JSX.Element => {
	const [{ isPreviewPaneActive }, setSettings] = useLocalStorage<Settings>('cloudy-settings', {
		isPreviewPaneActive: true,
	});

	const togglePreviewPane = useCallback(() => {
		setSettings((prev) => ({ ...prev, isPreviewPaneActive: !prev.isPreviewPaneActive }));
	}, [setSettings]);

	return (
		<SettingsContext.Provider
			value={useMemo(
				() => ({ isPreviewPaneActive, togglePreviewPane }),
				[isPreviewPaneActive, togglePreviewPane],
			)}
		>
			{children}
		</SettingsContext.Provider>
	);
};

export type { Props as SettingsProviderProps };
