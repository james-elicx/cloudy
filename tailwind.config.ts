import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';

const sharedColors = {
	transparent: 'transparent',
	inherit: 'inherit',
	accent: { DEFAULT: '#2ab9d5', dark: '#7fd5e6' },
	status: {
		info: '#2196FD',
		success: '#8aff59',
		warning: '#FFCC33',
		error: '#FF7259',
	},
};

const colors = {
	text: {
		...sharedColors,
		primary: { DEFAULT: '#050505', dark: '#fafafa' },
		secondary: { DEFAULT: '#303030', dark: '#d7d7d7' },
	},
	bg: {
		...sharedColors,
		background: { DEFAULT: '#fafafa', dark: '#121212' }, // #050505
		primary: { DEFAULT: '#90f0bf', dark: '#90f0bf' },
		secondary: { DEFAULT: '#e9e6e2', dark: '#1d1a16' },
	},
};

const config: Config = {
	darkMode: ['class', '[data-theme="dark"]'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		textColor: colors.text,
		backgroundColor: colors.bg,
		borderColor: colors.bg,
		outlineColor: colors.bg,
		textDecorationColor: colors.bg,

		extend: {
			fontFamily: {
				sans: ['var(--font-tasa-orbiter-text)'],
			},

			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},

			borderWidth: {
				1: '1px',
			},

			minWidth: {
				'2xs': '16rem/* 256px */',
				'3xs': '12rem/* 192px */',
			},

			maxWidth: {
				'2xs': '16rem/* 256px */',
				'3xs': '12rem/* 192px */',
			},

			screens: {
				xs: '475px',
			},
		},
	},
	plugins: [
		({ addVariant }: PluginAPI) => {
			addVariant('scrollbar', '&::-webkit-scrollbar');
			addVariant('scrollbar-track', '&::-webkit-scrollbar-track');
			addVariant('scrollbar-thumb', '&::-webkit-scrollbar-thumb');
			addVariant('slider-track', '&::-webkit-slider-runnable-track');
			addVariant('slider-thumb', '&::-webkit-slider-thumb');
		},
	],
};

export default config;
