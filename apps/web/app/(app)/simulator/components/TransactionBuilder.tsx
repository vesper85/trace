"use client";

import { useState, useCallback, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";
import { NetworkToggle } from "./NetworkToggle";
import { ArgumentForm, TypeArgumentsForm } from "./ArgumentForm";
import { NetworkType, FunctionArgument, TransactionPayload } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TransactionBuilderProps {
    onSimulate: (network: NetworkType, payload: TransactionPayload) => void;
    isLoading: boolean;
    walletAddress?: string;
}

export function TransactionBuilder({
    onSimulate,
    isLoading,
    walletAddress,
}: TransactionBuilderProps) {
    const [network, setNetwork] = useState<NetworkType>("testnet");
    const [sender, setSender] = useState(walletAddress || "");
    const [targetFunction, setTargetFunction] = useState("");
    const [typeArgs, setTypeArgs] = useState<string[]>([]);
    const [args, setArgs] = useState<FunctionArgument[]>([]);
    const [gasUnitPrice, setGasUnitPrice] = useState("100");
    const [maxGasAmount, setMaxGasAmount] = useState("2000");

    useEffect(() => {
        if (walletAddress && !sender) {
            setSender(walletAddress);
        }
    }, [walletAddress, sender]);

    const handleArgsChange = useCallback((newArgs: FunctionArgument[]) => {
        setArgs(newArgs);
    }, []);

    const handleSimulate = () => {
        if (!sender || !targetFunction) return;

        const payload: TransactionPayload = {
            sender,
            function: targetFunction,
            typeArguments: typeArgs.filter((t) => t.trim() !== ""),
            arguments: args.map((a) => a.value),
            gasUnitPrice,
            maxGasAmount,
        };

        onSimulate(network, payload);
    };

    const isValid = sender.trim() !== "" && targetFunction.trim() !== "";

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">Transaction Builder</h2>
                <p className="text-xs text-muted-foreground">Configure your transaction to simulate</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Network Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Network</label>
                    <NetworkToggle value={network} onChange={setNetwork} />
                </div>

                {/* Sender Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Sender Address</label>
                    <Input
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        placeholder="0x1234..."
                        className="font-mono text-sm"
                    />
                </div>

                {/* Target Function */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Target Function</label>
                    <Input
                        value={targetFunction}
                        onChange={(e) => setTargetFunction(e.target.value)}
                        placeholder="0x1::coin::transfer"
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Format: module_address::module_name::function_name
                    </p>
                </div>

                {/* Type Arguments */}
                <TypeArgumentsForm value={typeArgs} onChange={setTypeArgs} />

                {/* Function Arguments */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Function Arguments</label>
                    <ArgumentForm
                        functionSignature={targetFunction}
                        onChange={handleArgsChange}
                    />

                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            Or enter arguments manually (comma-separated):
                        </p>
                        <Input
                            placeholder="arg1, arg2, arg3"
                            onChange={(e) => {
                                const values = e.target.value.split(",").map((v) => v.trim());
                                setArgs(values.map((v, i) => ({ name: `arg${i}`, type: "unknown", value: v })));
                            }}
                            className="font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Gas Settings */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Gas Unit Price</label>
                        <Input
                            type="number"
                            value={gasUnitPrice}
                            onChange={(e) => setGasUnitPrice(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Gas Amount</label>
                        <Input
                            type="number"
                            value={maxGasAmount}
                            onChange={(e) => setMaxGasAmount(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Simulate Button */}
            <div className="p-4 border-t">
                <Button
                    onClick={handleSimulate}
                    disabled={!isValid || isLoading}
                    className="w-full"
                    size="lg"
                >
                    {isLoading ? (
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
            </div>
        </div>
    );
}
