import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '8001',
				pathname: '/api/cms/asset/**',
			},
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '5mb',
		},
	},
};

export default nextConfig;
