/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    devIndicators: {
        buildActivity: false, // Hides the compilation/build icon
        appIsrStatus: false,  // Hides the static indicator (lightning bolt)
    },
};

const withNextra = require("nextra")({
    theme: "nextra-theme-docs",
    themeConfig: "./theme.config.tsx",
});

module.exports = withNextra(nextConfig);
