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
            <span style={{ fontWeight: 600, fontSize: "18px" }}>Docs</span>
        </div>
    ),
    project: {
        link: "https://github.com/vesper85/trace",
    },
    docsRepositoryBase: "https://github.com/vesper85/trace/tree/main/apps/docs",
    footer: {
        text: (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src="/logo.png" alt="Trace" style={{ height: "24px", width: "auto" }} />
                    <span>Trace - Movement L1 DevTools</span>
                </div>
                <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    © {new Date().getFullYear()} Trace. Built for the Movement ecosystem.
                </span>
            </div>
        ),
    },
    head: (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="Trace Documentation" />
            <meta property="og:description" content="Documentation for Trace - Movement L1 debugging and development tools" />
            <meta property="og:image" content="/logo.png" />
            <link rel="icon" href="/favicon.png" type="image/png" />
        </>
    ),
    useNextSeoProps() {
        return {
            titleTemplate: "%s – Trace Docs",
        };
    },
    primaryHue: 30,
    primarySaturation: 100,
    sidebar: {
        defaultMenuCollapseLevel: 2,
        toggleButton: true,
    },
    toc: {
        backToTop: true,
    },
    banner: {
        key: "trace-beta",
        text: (
            <a href="/examples" style={{ textDecoration: "none" }}>
                🚀 Trace is in beta! Check out the new API examples →
            </a>
        ),
    },
    navigation: {
        prev: true,
        next: true,
    },
    editLink: {
        text: "Edit this page on GitHub →",
    },
    feedback: {
        content: "Question? Give us feedback →",
        labels: "feedback",
    },
};

export default config;
