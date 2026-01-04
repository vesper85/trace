"use client";

import { useState, useCallback } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionPanel } from "./components/SessionPanel";
import { FundAccountPanel } from "./components/FundAccountPanel";
// Reuse components from simulator
import { ContractBlock } from "../simulator/components/ContractBlock";
import { TransactionParameters } from "../simulator/components/TransactionParameters";
import { SimulationResultsPanel } from "../simulator/components/SimulationResultsPanel";
import { WalletButton } from "../simulator/components/WalletButton";
import {
    type NetworkType,
    type ModuleInfo,
    type MoveExposedFunction,
    type FunctionInputValue,
    type SimulationResult,
} from "../simulator/types";
import {
    executeTransaction,
    viewFunction,
    getSession,
    type SessionConfig,
} from "./lib/api";

export default function VirtualnetContent() {
    // Session state
    const [selectedSession, setSelectedSession] = useState<SessionConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    // Handle simulation using the backend API
    const handleSimulate = async (params: {
        senderAddress: string;
        gasLimit: string;
        gasPrice: string;
    }) => {
        if (!selectedSession) {
            setSimulationError("Please select a fork session first");
            return;
        }

        if (!selectedModule || !selectedFunction) {
            setSimulationError("Please select a module and function first");
            return;
        }

        setIsSimulating(true);
        setSimulationError(null);
        setSimulationResult(null);

        const functionId = `${contractAddress}::${selectedModule.name}::${selectedFunction.name}`;

        try {
            if (selectedFunction.is_view) {
                // View function
                const result = await viewFunction(selectedSession.id, {
                    functionId,
                    typeArguments: typeArguments.filter(t => t.trim() !== ""),
                    args: functionInputs.map(i => i.value),
                });

                setSimulationResult({
                    success: result.success,
                    vmStatus: result.success ? "View function executed successfully" : (result.error || "Failed"),
                    gasUsed: result.gasUsed || 0,
                    gasUnitPrice: 0,
                    maxGasAmount: 0,
                    events: [],
                    changes: [],
                    rawResponse: result.result,
                });
            } else {
                // Entry function
                const result = await executeTransaction(selectedSession.id, {
                    functionId,
                    typeArguments: typeArguments.filter(t => t.trim() !== ""),
                    args: functionInputs.map(i => i.value),
                    sender: params.senderAddress,
                });

                setSimulationResult({
                    success: result.success,
                    vmStatus: result.status,
                    gasUsed: result.gasUsed,
                    gasUnitPrice: 0,
                    maxGasAmount: 0,
                    events: result.events?.map((e: any) => ({
                        type: e.type,
                        data: e.data,
                        sequenceNumber: e.sequence_number,
                    })) || [],
                    changes: result.writeSet || [],
                    rawResponse: result,
                });
            }
        } catch (err) {
            console.error("Simulation failed:", err);
            setSimulationError(
                err instanceof Error ? err.message : "Simulation failed"
            );
        } finally {
            setIsSimulating(false);
        }
    };

    // Reload session after operations
    const handleSessionRefresh = useCallback(async () => {
        if (selectedSession) {
            try {
                const detail = await getSession(selectedSession.id);
                setSelectedSession(detail.config);
            } catch {
                // Ignore refresh errors
            }
        }
    }, [selectedSession]);

    // Check if we can simulate
    const canSimulate = Boolean(
        selectedSession &&
        contractAddress &&
        selectedModule &&
        selectedFunction
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex-none flex h-14 items-center justify-between border-b bg-background px-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold">VirtualNet</h1>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                        Fork Simulator
                    </span>
                </div>
                <WalletButton />
            </header>

            {/* Error Banner */}
            {error && (
                <div className="flex-none flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border-b">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm flex-1">{error}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setError(null)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-h-0 flex">
                {/* Left Sidebar - Sessions */}
                <div className="w-80 border-r flex flex-col bg-muted/30">
                    <div className="flex-1 min-h-0">
                        <SessionPanel
                            selectedSession={selectedSession}
                            onSessionSelect={setSelectedSession}
                            onError={setError}
                        />
                    </div>
                    <div className="border-t p-3">
                        <FundAccountPanel
                            session={selectedSession}
                            onSuccess={handleSessionRefresh}
                            onError={setError}
                        />
                    </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 min-h-0 p-4 md:p-6 overflow-auto">
                    <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto">
                        {/* Session Info Banner */}
                        {selectedSession && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Active Session: <code className="text-xs">{selectedSession.id}</code>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Network: {selectedSession.network}
                                        {selectedSession.networkVersion && ` • Version: ${selectedSession.networkVersion}`}
                                        {` • Operations: ${selectedSession.ops}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Contract Selection */}
                        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                            <ContractBlock
                                onNetworkChange={() => { }} // Not used in fork mode
                                onContractAddressChange={handleContractChange}
                                onModuleChange={handleModuleChange}
                                onFunctionChange={handleFunctionChange}
                                onInputsChange={handleInputsChange}
                                onTypeArgumentsChange={handleTypeArgumentsChange}
                            />
                        </div>

                        {/* Transaction Parameters */}
                        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                            <TransactionParameters
                                onSimulate={handleSimulate}
                                isSimulating={isSimulating}
                                walletAddress={undefined}
                                canSimulate={canSimulate}
                            />
                        </div>

                        {/* Simulation Results */}
                        {(simulationResult || simulationError) && (
                            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
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

                        {/* No Session Warning */}
                        {!selectedSession && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Fork Session Selected</h3>
                                <p className="text-muted-foreground max-w-md">
                                    Create or select a fork session from the sidebar to start simulating
                                    transactions with custom state modifications.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
