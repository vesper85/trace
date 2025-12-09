"use client";

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";

// Dynamic import with ssr:false to avoid Aptos SDK Node.js module issues
const WalletProviderInner = dynamic(() => import("./WalletProvider"), {
    ssr: false,
});

export function WalletProvider({ children }: PropsWithChildren) {
    return <WalletProviderInner>{ children } </WalletProviderInner>;
}
