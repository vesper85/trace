"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { TransactionBuilder } from "./components/TransactionBuilder";
import { SimulationConfig } from "./components/SimulationConfig";
import { SimulationResults } from "./components/SimulationResults";
import { WalletButton } from "./components/WalletButton";
import { useSimulation } from "./hooks/useSimulation";
import {
    NetworkType,
    TransactionPayload,
    SimulationConfig as SimConfigType,
} from "./types";

export default function SimulatorContent() {
    const { account } = useWallet();
    const [config, setConfig] = useState<SimConfigType>({
        stateOverrides: [],
    });

    const { isLoading, error, result, simulate, isWalletConnected } =
        useSimulation();

    const handleSimulate = (network: NetworkType, payload: TransactionPayload) => {
        simulate(network, payload);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex-none flex h-14 items-center justify-between border-b bg-background px-6">
                <h1 className="text-lg font-semibold">Transaction Simulator</h1>
                <WalletButton />
            </header>

            {/* Content */}
            <div className="flex-1 min-h-0 p-4 md:p-6 overflow-hidden">
                <div className="flex flex-col h-full space-y-4 md:space-y-6">
                    {/* Wallet Connection Notice */}
                    {!isWalletConnected && (
                        <div className="flex-none p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Connect your wallet</strong> to simulate transactions.
                                Your wallet&apos;s public key is required for transaction simulation.
                            </p>
                        </div>
                    )}

                    {/* 3 Column Layout - Panels scroll internally */}
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {/* Column A: Transaction Builder */}
                        <div className="flex flex-col min-h-0 rounded-lg border bg-card shadow-sm overflow-hidden">
                            <TransactionBuilder
                                onSimulate={handleSimulate}
                                isLoading={isLoading}
                                walletAddress={account?.address.toString()}
                            />
                        </div>

                        {/* Column B: Simulation Config */}
                        <div className="flex flex-col min-h-0 rounded-lg border bg-card shadow-sm overflow-hidden">
                            <SimulationConfig value={config} onChange={setConfig} />
                        </div>

                        {/* Column C: Simulation Results */}
                        <div className="flex flex-col min-h-0 rounded-lg border bg-card shadow-sm lg:col-span-2 xl:col-span-1 overflow-hidden">
                            <SimulationResults
                                result={result}
                                error={error}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
