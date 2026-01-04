"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the simulator content with SSR disabled
// This prevents the Aptos SDK Node.js modules from being loaded during SSR
const SimulatorContent = dynamic(() => import("./SimulatorContent"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                    Loading Simulator...
                </p>
            </div>
        </div>
    ),
});

export default function SimulatorPage() {
    return <SimulatorContent />;
}
