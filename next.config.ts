/** @type {import('next').NextConfig} */
import webpack from 'webpack';
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig = {
    trailingSlash: true,
    // Remove exportTrailingSlash as it's deprecated in newer Next.js versions
    
    webpack: (config: { resolve: { fallback: { crypto: string; stream: string; http: string; https: string; zlib: string; }; }; plugins: webpack.ProvidePlugin[]; }) => {
        config.resolve.fallback = {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            zlib: require.resolve('browserify-zlib'),
        };

        config.plugins.push(
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            })
        );

        return config;
    },
};

// if (process.env.NODE_ENV === 'development') {
//   await setupDevPlatform();
// }

module.exports = nextConfig;