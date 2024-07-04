import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import { resolve } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
	await setupDevPlatform({
		configPath: resolve('wrangler.dev.toml'),
	});
}
