"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SimulationParams {
    senderAddress: string;
    gasLimit: string;
    gasPrice: string;
}

interface TransactionParametersProps {
    onSimulate?: (params: SimulationParams) => void;
    isSimulating?: boolean;
    walletAddress?: string;
    canSimulate?: boolean;
}

interface StateOverride {
    id: string;
    address: string;
    key: string;
    value: string;
}

export function TransactionParameters({
    onSimulate,
    isSimulating = false,
    walletAddress = "",
    canSimulate = false,
}: TransactionParametersProps) {
    // Transaction parameters
    const [usePendingBlock, setUsePendingBlock] = useState(true);
    const [blockNumber, setBlockNumber] = useState("");
    const [txIndex, setTxIndex] = useState("");
    const [fromAddress, setFromAddress] = useState(walletAddress);
    const [gas, setGas] = useState("8000000");
    const [useCustomGas, setUseCustomGas] = useState(false);
    const [gasPrice, setGasPrice] = useState("0");
    const [value, setValue] = useState("0");

    // Block Header Overrides
    const [blockOverridesExpanded, setBlockOverridesExpanded] = useState(true);
    const [overrideBlockNumber, setOverrideBlockNumber] = useState(false);
    const [overrideBlockNumberValue, setOverrideBlockNumberValue] = useState("");
    const [overrideTimestamp, setOverrideTimestamp] = useState(false);
    const [overrideTimestampValue, setOverrideTimestampValue] = useState("");

    // State Overrides
    const [stateOverridesExpanded, setStateOverridesExpanded] = useState(true);
    const [stateOverrides, setStateOverrides] = useState<StateOverride[]>([]);

    // Add new state override
    const addStateOverride = () => {
        setStateOverrides([
            ...stateOverrides,
            {
                id: crypto.randomUUID(),
                address: "",
                key: "",
                value: "",
            },
        ]);
    };

    // Remove state override
    const removeStateOverride = (id: string) => {
        setStateOverrides(stateOverrides.filter((o) => o.id !== id));
    };

    // Update state override
    const updateStateOverride = (
        id: string,
        field: keyof StateOverride,
        value: string
    ) => {
        setStateOverrides(
            stateOverrides.map((o) =>
                o.id === id ? { ...o, [field]: value } : o
            )
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-lg font-semibold">Transaction Parameters</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronUp className="w-4 h-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Use Pending Block */}
                <div className="flex items-center gap-3">
                    <Switch
                        checked={usePendingBlock}
                        onCheckedChange={setUsePendingBlock}
                    />
                    <Label className="text-sm">Use Pending Block</Label>
                </div>

                {/* Block Number */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm text-muted-foreground">Block Number</Label>
                    <Input
                        value={usePendingBlock ? "/" : blockNumber}
                        onChange={(e) => setBlockNumber(e.target.value)}
                        disabled={usePendingBlock}
                        className="font-mono text-sm"
                        placeholder="/"
                    />
                </div>

                {/* Tx Index */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm text-muted-foreground">Tx Index</Label>
                    <Input
                        value={txIndex}
                        onChange={(e) => setTxIndex(e.target.value)}
                        className="font-mono text-sm"
                        placeholder="/"
                    />
                </div>

                {/* From Address */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm text-muted-foreground">From</Label>
                    <Input
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                        className="font-mono text-sm"
                        placeholder="0x..."
                    />
                </div>

                {/* Gas */}
                <div className="space-y-2">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label className="text-sm text-muted-foreground">Gas</Label>
                        <Input
                            value={gas}
                            onChange={(e) => setGas(e.target.value)}
                            disabled={!useCustomGas}
                            className="font-mono text-sm"
                            placeholder="8000000"
                        />
                    </div>
                    <button
                        onClick={() => setUseCustomGas(!useCustomGas)}
                        className="text-sm text-primary hover:underline ml-[136px]"
                    >
                        {useCustomGas ? "Use default gas value" : "Use custom gas value"}
                    </button>
                </div>

                {/* Gas Price */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm text-muted-foreground">Gas Price</Label>
                    <Input
                        value={gasPrice}
                        onChange={(e) => setGasPrice(e.target.value)}
                        className="font-mono text-sm"
                        placeholder="0"
                    />
                </div>

                {/* Value */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm text-muted-foreground">Value</Label>
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="font-mono text-sm"
                        placeholder="0"
                    />
                </div>

                {/* Block Header Overrides Section */}
                <div className="pt-4 border-t">
                    <button
                        onClick={() => setBlockOverridesExpanded(!blockOverridesExpanded)}
                        className="flex items-center justify-between w-full"
                    >
                        <h3 className="text-base font-semibold">Block Header Overrides</h3>
                        {blockOverridesExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </button>

                    {blockOverridesExpanded && (
                        <div className="mt-4 space-y-4">
                            {/* Override Block Number */}
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={overrideBlockNumber}
                                    onCheckedChange={setOverrideBlockNumber}
                                />
                                <Label className="text-sm">Override Block Number</Label>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <Label className="text-sm text-muted-foreground">Block Number</Label>
                                <Input
                                    value={overrideBlockNumber ? overrideBlockNumberValue : "/"}
                                    onChange={(e) => setOverrideBlockNumberValue(e.target.value)}
                                    disabled={!overrideBlockNumber}
                                    className="font-mono text-sm"
                                    placeholder="/"
                                />
                            </div>

                            {/* Override Timestamp */}
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={overrideTimestamp}
                                    onCheckedChange={setOverrideTimestamp}
                                />
                                <Label className="text-sm">Override Timestamp</Label>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                <Label className="text-sm text-muted-foreground">Timestamp</Label>
                                <Input
                                    value={overrideTimestamp ? overrideTimestampValue : "/"}
                                    onChange={(e) => setOverrideTimestampValue(e.target.value)}
                                    disabled={!overrideTimestamp}
                                    className="font-mono text-sm"
                                    placeholder="/"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* State Overrides Section */}
                <div className="pt-4 border-t">
                    <button
                        onClick={() => setStateOverridesExpanded(!stateOverridesExpanded)}
                        className="flex items-center justify-between w-full"
                    >
                        <h3 className="text-base font-semibold">State Overrides</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addStateOverride();
                                }}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                            {stateOverridesExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                    </button>

                    {stateOverridesExpanded && (
                        <div className="mt-4 space-y-4">
                            {stateOverrides.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No state overrides. Click + to add one.
                                </p>
                            ) : (
                                stateOverrides.map((override) => (
                                    <div
                                        key={override.id}
                                        className="p-3 rounded-lg bg-muted/30 border space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">State Override</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-destructive hover:text-destructive"
                                                onClick={() => removeStateOverride(override.id)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <Input
                                            value={override.address}
                                            onChange={(e) =>
                                                updateStateOverride(override.id, "address", e.target.value)
                                            }
                                            className="font-mono text-sm"
                                            placeholder="Address"
                                        />
                                        <Input
                                            value={override.key}
                                            onChange={(e) =>
                                                updateStateOverride(override.id, "key", e.target.value)
                                            }
                                            className="font-mono text-sm"
                                            placeholder="Storage Key"
                                        />
                                        <Input
                                            value={override.value}
                                            onChange={(e) =>
                                                updateStateOverride(override.id, "value", e.target.value)
                                            }
                                            className="font-mono text-sm"
                                            placeholder="Value"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Simulate Button */}
            <div className="p-5 border-t">
                <Button
                    onClick={() => {
                        onSimulate?.({
                            senderAddress: fromAddress,
                            gasLimit: gas,
                            gasPrice: gasPrice,
                        });
                    }}
                    disabled={isSimulating || !canSimulate}
                    className="w-full"
                    size="lg"
                >
                    {isSimulating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Simulating...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Simulate Transaction
                        </>
                    )}
                </Button>
                {!canSimulate && !isSimulating && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Select a contract, module, and function to simulate
                    </p>
                )}
            </div>
        </div>
    );
}
