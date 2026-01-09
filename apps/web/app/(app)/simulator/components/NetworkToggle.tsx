"use client";

import { NetworkType, NETWORKS } from "../types";
import { Button } from "@/components/ui/button";

interface NetworkToggleProps {
    value: NetworkType;
    onChange: (network: NetworkType) => void;
}

export function NetworkToggle({ value, onChange }: NetworkToggleProps) {
    const networks: NetworkType[] = ["mainnet", "testnet", "devnet"];

    return (
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {networks.map((network) => (
                <Button
                    key={network}
                    variant={value === network ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onChange(network)}
                    className="flex-1"
                >
                    {NETWORKS[network].name}
                </Button>
            ))}
        </div>
    );
}
