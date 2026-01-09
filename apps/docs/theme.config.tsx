import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
    logo: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
                src="/logo.png"
                alt="Trace Logo"
                style={{ height: "32px", width: "auto" }}
            />
        </div>
    ),
    project: {
        link: "https://github.com/your-org/trace",
    },
    docsRepositoryBase: "https://github.com/your-org/trace/tree/main/apps/docs",
    footer: {
        text: "Trace - Movement L1 DevTools",
    },
    head: (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="Trace Documentation" />
            <meta property="og:description" content="Documentation for Trace - Movement L1 debugging and development tools" />
        </>
    ),
    useNextSeoProps() {
        return {
            titleTemplate: "%s – Trace Docs",
        };
    },
    primaryHue: 30,
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
    },
    toc: {
        backToTop: true,
    },
};

export default config;
