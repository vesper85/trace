"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ContractBlock } from "./components/ContractBlock";
import { TransactionParameters } from "./components/TransactionParameters";
import { SimulationResultsPanel } from "./components/SimulationResultsPanel";
import { WalletButton } from "./components/WalletButton";
import {
    NetworkType,
    ModuleInfo,
    MoveExposedFunction,
    FunctionInputValue,
    SimulationResult
} from "./types";
import { simulateTransaction, SimulationInput } from "@/lib/movement";

export default function SimulatorContent() {
    const { account } = useWallet();

    // Network state
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("mainnet");

    // Contract state (from ContractBlock)
    const [contractAddress, setContractAddress] = useState<string>("");
    const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
    const [selectedFunction, setSelectedFunction] = useState<MoveExposedFunction | null>(null);
    const [functionInputs, setFunctionInputs] = useState<FunctionInputValue[]>([]);
    const [typeArguments, setTypeArguments] = useState<string[]>([]);

    // Simulation state
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [simulationError, setSimulationError] = useState<string | null>(null);

    // Handle contract changes
    const handleContractChange = useCallback((address: string) => {
        setContractAddress(address);
        setSelectedModule(null);
        setSelectedFunction(null);
        setFunctionInputs([]);
        setTypeArguments([]);
    }, []);

    const handleModuleChange = useCallback((module: ModuleInfo | null) => {
        setSelectedModule(module);
        setSelectedFunction(null);
        setFunctionInputs([]);
        setTypeArguments([]);
    }, []);

    const handleFunctionChange = useCallback((func: MoveExposedFunction | null) => {
        setSelectedFunction(func);
    }, []);

    const handleInputsChange = useCallback((inputs: FunctionInputValue[]) => {
        setFunctionInputs(inputs);
    }, []);

    const handleTypeArgumentsChange = useCallback((typeArgs: string[]) => {
        setTypeArguments(typeArgs);
    }, []);

    // Handle simulation
    const handleSimulate = async (params: {
        senderAddress: string;
        gasLimit: string;
        gasPrice: string;
    }) => {
        if (!selectedModule || !selectedFunction) {
            setSimulationError("Please select a module and function first");
            return;
        }

        setIsSimulating(true);
        setSimulationError(null);
        setSimulationResult(null);

        try {
            // Check if this is a view function
            if (selectedFunction.is_view) {
                // Import dynamically to avoid circular deps
                const { callViewFunction, ViewInput } = await import("@/lib/movement");

                const viewInput = {
                    contractAddress: contractAddress,
                    moduleName: selectedModule.name,
                    functionName: selectedFunction.name,
                    typeArguments: typeArguments.filter(t => t.trim() !== ""),
                    functionArguments: functionInputs.map(i => i.value),
                };

                console.log("Calling view function with input:", viewInput);

                const result = await callViewFunction(selectedNetwork, viewInput);

                console.log("View function result:", result);

                setSimulationResult({
                    success: result.success,
                    vmStatus: "View function executed successfully",
                    gasUsed: 0,
                    gasUnitPrice: 0,
                    maxGasAmount: 0,
                    events: [],
                    changes: [],
                    rawResponse: result.rawResponse,
                });
            } else {
                // Entry function - use transaction simulation
                const input: SimulationInput = {
                    contractAddress: contractAddress,
                    moduleName: selectedModule.name,
                    functionName: selectedFunction.name,
                    typeArguments: typeArguments.filter(t => t.trim() !== ""),
                    functionArguments: functionInputs.map(i => i.value),
                    senderAddress: params.senderAddress,
                    gasLimit: params.gasLimit,
                    gasPrice: params.gasPrice,
                };

                console.log("Simulating with input:", input);

                const result = await simulateTransaction(selectedNetwork, input);

                console.log("Simulation result:", result);

                setSimulationResult({
                    success: result.success,
                    vmStatus: result.vmStatus,
                    gasUsed: result.gasUsed,
                    gasUnitPrice: result.gasUnitPrice,
                    maxGasAmount: result.maxGasAmount,
                    events: result.events.map(e => ({
                        type: e.type,
                        data: e.data as Record<string, unknown>,
                        sequenceNumber: e.sequence_number,
                    })),
                    changes: result.changes,
                    rawResponse: result.rawResponse,
                });
            }
        } catch (error) {
            console.error("Simulation failed:", error);
            setSimulationError(
                error instanceof Error ? error.message : "Simulation failed"
            );
        } finally {
            setIsSimulating(false);
        }
    };

    // Check if we can simulate
    const canSimulate = Boolean(
        contractAddress &&
        selectedModule &&
        selectedFunction
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex-none flex h-14 items-center justify-between border-b bg-background px-6">
                <h1 className="text-lg font-semibold">Transaction Simulator</h1>
                <WalletButton />
            </header>

            {/* Content */}
            <div className="flex-1 min-h-0 p-4 md:p-6 overflow-hidden">
                <div className="flex flex-col h-full gap-4 md:gap-6">
                    {/* 2 Column Layout for Contract + Transaction Parameters */}
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Column A: Contract Block */}
                        <div className="flex flex-col min-h-0 rounded-lg border bg-card shadow-sm overflow-hidden">
                            <ContractBlock
                                onNetworkChange={setSelectedNetwork}
                                onContractAddressChange={handleContractChange}
                                onModuleChange={handleModuleChange}
                                onFunctionChange={handleFunctionChange}
                                onInputsChange={handleInputsChange}
                                onTypeArgumentsChange={handleTypeArgumentsChange}
                            />
                        </div>

                        {/* Column B: Transaction Parameters */}
                        <div className="flex flex-col min-h-0 rounded-lg border bg-card shadow-sm overflow-hidden">
                            <TransactionParameters
                                onSimulate={handleSimulate}
                                isSimulating={isSimulating}
                                walletAddress={account?.address.toString()}
                                canSimulate={canSimulate}
                            />
                        </div>
                    </div>

                    {/* Simulation Results */}
                    {(simulationResult || simulationError) && (
                        <div className="flex-none rounded-lg border bg-card shadow-sm overflow-hidden">
                            <SimulationResultsPanel
                                result={simulationResult}
                                error={simulationError}
                                onClose={() => {
                                    setSimulationResult(null);
                                    setSimulationError(null);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
