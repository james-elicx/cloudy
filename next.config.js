/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	experimental: {
		serverActions: true,
	},
};

module.exports = nextConfig;
