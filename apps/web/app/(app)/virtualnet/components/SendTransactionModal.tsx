"use client";

import { useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ContractSelector,
    type ModuleInfo,
    type MoveExposedFunction,
    type FunctionInputValue,
} from "./ContractSelector";
import { executeTransaction, viewFunction, type SessionConfig } from "../lib/api";

interface SendTransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: SessionConfig;
    onSuccess: (result: TransactionResult) => void;
    onError: (error: string) => void;
}

export interface TransactionResult {
    functionId: string;
    sender: string;
    success: boolean;
    status: string;
    gasUsed: number;
    timestamp: string;
    typeArguments?: string[];
    args?: string[];
    events?: unknown[];
    writeSet?: unknown[];
    vmStatus?: string;
    rawOutput?: string;
}

export function SendTransactionModal({
    open,
    onOpenChange,
    session,
    onSuccess,
    onError,
}: SendTransactionModalProps) {
    // Contract state
    const [contractAddress, setContractAddress] = useState<string>("");
    const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
    const [selectedFunction, setSelectedFunction] = useState<MoveExposedFunction | null>(null);
    const [functionInputs, setFunctionInputs] = useState<FunctionInputValue[]>([]);
    const [typeArguments, setTypeArguments] = useState<string[]>([]);

    // Transaction params - sender is optional for fork simulation
    const [senderAddress, setSenderAddress] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);

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

    /**
     * Format a function argument for the Aptos CLI.
     * The CLI expects arguments in `type:value` format, e.g., `u64:100`, `address:0x1`, `bool:true`
     */
    const formatCliArg = (type: string, value: string): string => {
        // Normalize the Move type to CLI type format
        // Common types: u8, u16, u32, u64, u128, u256, bool, address, vector<T>, etc.

        // Handle primitive types
        if (type.match(/^u(8|16|32|64|128|256)$/)) {
            return `${type}:${value}`;
        }

        if (type === 'bool') {
            return `bool:${value}`;
        }

        if (type === 'address') {
            return `address:${value}`;
        }

        // Handle vector types like vector<u8>
        if (type.startsWith('vector<')) {
            // For hex strings (common for vector<u8>), use hex format
            if (type === 'vector<u8>' && value.startsWith('0x')) {
                return `hex:${value}`;
            }
            // Otherwise pass as-is, the CLI should handle it
            return `${type}:${value}`;
        }

        // For Object<T> types, treat as address
        if (type.startsWith('0x1::object::Object<')) {
            return `address:${value}`;
        }

        // Default: treat as raw string
        // For complex types, user may need to format correctly
        return `${type}:${value}`;
    };

    // For view functions, sender is not required
    // For entry functions, sender is optional in virtualnet (the backend can use a default)
    const canExecute = Boolean(
        contractAddress &&
        selectedModule &&
        selectedFunction
    );

    const handleExecute = async () => {
        if (!selectedModule || !selectedFunction) return;

        setIsExecuting(true);
        const functionId = `${contractAddress}::${selectedModule.name}::${selectedFunction.name}`;
        const filteredTypeArgs = typeArguments.filter(t => t.trim() !== "");
        // Format args as type:value pairs for the Aptos CLI
        const args = functionInputs.map(i => formatCliArg(i.type, i.value));

        try {
            if (selectedFunction.is_view) {
                const result = await viewFunction(session.id, {
                    functionId,
                    typeArguments: filteredTypeArgs,
                    args,
                });

                onSuccess({
                    functionId,
                    sender: "view",
                    success: result.success,
                    status: result.success ? "View executed" : (result.error || "Failed"),
                    gasUsed: result.gasUsed || 0,
                    timestamp: new Date().toISOString(),
                    typeArguments: filteredTypeArgs,
                    args,
                });
            } else {
                // Show info toast for entry function simulation
                toast.info("Simulating transaction...", {
                    description: "This may take a few seconds. Please wait while we execute and analyze the transaction.",
                    duration: 5000,
                });

                const result = await executeTransaction(session.id, {
                    functionId,
                    typeArguments: filteredTypeArgs,
                    args,
                    sender: senderAddress || undefined, // Optional - backend can use default
                });


                onSuccess({
                    functionId,
                    sender: senderAddress || "default",
                    success: result.success,
                    status: result.status,
                    gasUsed: result.gasUsed,
                    timestamp: new Date().toISOString(),
                    typeArguments: filteredTypeArgs,
                    args,
                    events: result.events,
                    writeSet: result.writeSet,
                    vmStatus: result.vmStatus,
                    rawOutput: result.rawOutput,
                });
            }

            // Reset form
            setContractAddress("");
            setSelectedModule(null);
            setSelectedFunction(null);
            setFunctionInputs([]);
            setTypeArguments([]);
            setSenderAddress("");
            onOpenChange(false);
        } catch (err) {
            onError(err instanceof Error ? err.message : "Transaction failed");
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Transaction
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto space-y-4 pr-2">
                    {/* Contract Selection */}
                    <div className="rounded-lg border bg-muted/30 overflow-hidden">
                        <ContractSelector
                            networkUrl={session.nodeUrl}
                            onContractAddressChange={handleContractChange}
                            onModuleChange={handleModuleChange}
                            onFunctionChange={handleFunctionChange}
                            onInputsChange={handleInputsChange}
                            onTypeArgumentsChange={handleTypeArgumentsChange}
                        />
                    </div>

                    {/* Sender Address (optional for entry functions) */}
                    {selectedFunction && !selectedFunction.is_view && (
                        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                            <Label htmlFor="sender">
                                Sender Address
                                <span className="text-xs text-muted-foreground ml-2">(optional)</span>
                            </Label>
                            <Input
                                id="sender"
                                placeholder="0x... (leave empty to use default)"
                                value={senderAddress}
                                onChange={(e) => setSenderAddress(e.target.value)}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                The account that will sign this transaction. If empty, a default account will be used.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isExecuting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExecute}
                        disabled={!canExecute || isExecuting}
                        className="gap-2"
                    >
                        {isExecuting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Executing...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {selectedFunction?.is_view ? "Execute View" : "Simulate Transaction"}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
