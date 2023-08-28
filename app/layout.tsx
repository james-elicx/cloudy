import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { LocationProvider, ThemeProvider, SideNav, TopNav } from '@/components';
import './globals.css';
import { getBucketsFromEnv } from '@/utils/cf';

export const runtime = 'edge';

const TASAOrbiterText = localFont({
	variable: '--font-tasa-orbiter-text',
	src: [
		{ path: '../utils/fonts/TASAOrbiterText-Regular.otf', weight: '400' },
		{ path: '../utils/fonts/TASAOrbiterText-Medium.otf', weight: '500' },
		{ path: '../utils/fonts/TASAOrbiterText-SemiBold.otf', weight: '600' },
		{ path: '../utils/fonts/TASAOrbiterText-Bold.otf', weight: '700' },
	],
});

export const metadata: Metadata = {
	title: {
		default: 'Home',
		template: '%s | Cloudy',
	},
	description: 'File explorer for Cloudflare R2 Storage.',
	icons: {
		icon: [{ url: '/favicon.ico', type: 'image/x-icon', sizes: 'any', rel: 'icon' }],
		shortcut: [
			{ url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16', rel: 'shortcut icon' },
			{ url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32', rel: 'shortcut icon' },
		],
		apple: {
			url: '/apple-touch-icon.png',
			type: 'image/png',
			sizes: '180x180',
			rel: 'apple-touch-icon',
		},
	},
	manifest: '/site.webmanifest',
};

type Props = { children: React.ReactNode };

const buckets = getBucketsFromEnv();

const Layout = async ({ children }: Props) => (
	<html lang="en">
		<body className={TASAOrbiterText.variable}>
			<ThemeProvider attribute="data-theme" defaultTheme="light">
				<LocationProvider buckets={Object.keys(buckets)}>
					<div className="flex flex-grow flex-row">
						<SideNav />

						<div className="flex h-screen flex-grow flex-col overflow-y-auto">
							<TopNav />

							{children}
						</div>
					</div>
				</LocationProvider>
			</ThemeProvider>
		</body>
	</html>
);

export default Layout;
