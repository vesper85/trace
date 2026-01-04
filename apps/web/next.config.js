/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: [
        'keyv',
        'cacheable-request',
        '@aptos-labs/ts-sdk',
    ],
};

export default nextConfig;
