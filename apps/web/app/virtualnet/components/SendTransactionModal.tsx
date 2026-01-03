"use client";

import { useState, useCallback } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractBlock } from "../../simulator/components/ContractBlock";
import type {
    ModuleInfo,
    MoveExposedFunction,
    FunctionInputValue,
} from "../../simulator/types";
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

    // Transaction params
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

    const canExecute = Boolean(
        contractAddress &&
        selectedModule &&
        selectedFunction &&
        (selectedFunction?.is_view || senderAddress)
    );

    const handleExecute = async () => {
        if (!selectedModule || !selectedFunction) return;

        setIsExecuting(true);
        const functionId = `${contractAddress}::${selectedModule.name}::${selectedFunction.name}`;
        const filteredTypeArgs = typeArguments.filter(t => t.trim() !== "");
        const args = functionInputs.map(i => i.value);

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
                const result = await executeTransaction(session.id, {
                    functionId,
                    typeArguments: filteredTypeArgs,
                    args,
                    sender: senderAddress,
                });

                onSuccess({
                    functionId,
                    sender: senderAddress,
                    success: result.success,
                    status: result.status,
                    gasUsed: result.gasUsed,
                    timestamp: new Date().toISOString(),
                    typeArguments: filteredTypeArgs,
                    args,
                    events: result.events,
                    writeSet: result.writeSet,
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Transaction
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto space-y-4 pr-2">
                    {/* Contract Selection */}
                    <div className="rounded-lg border bg-muted/30 overflow-hidden">
                        <ContractBlock
                            onNetworkChange={() => { }}
                            onContractAddressChange={handleContractChange}
                            onModuleChange={handleModuleChange}
                            onFunctionChange={handleFunctionChange}
                            onInputsChange={handleInputsChange}
                            onTypeArgumentsChange={handleTypeArgumentsChange}
                        />
                    </div>

                    {/* Sender Address (only for entry functions) */}
                    {selectedFunction && !selectedFunction.is_view && (
                        <div className="space-y-2 p-4 rounded-lg border bg-muted/30">
                            <Label htmlFor="sender">Sender Address</Label>
                            <Input
                                id="sender"
                                placeholder="0x..."
                                value={senderAddress}
                                onChange={(e) => setSenderAddress(e.target.value)}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                The account that will sign this transaction
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
