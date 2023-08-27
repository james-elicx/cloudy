'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from '../icons';

export { ThemeProvider } from 'next-themes';

export const ThemeToggle = () => {
	const { setTheme, theme } = useTheme();

	return (
		<button
			type="button"
			title="Toggle theme"
			className="text-primary transition-all hover:text-accent dark:text-primary-dark dark:hover:text-accent-dark"
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
		>
			<Moon weight="bold" className="block h-5 w-5 dark:hidden" />
			<Sun weight="bold" className="hidden h-5 w-5 dark:block" />
		</button>
	);
};
