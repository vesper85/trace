"use client";

import { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    Fuel,
    Zap,
    Database,
    ChevronDown,
    ChevronUp,
    Activity,
    FileText,
    Layers,
    Coins,
    Code2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OperationContents, OperationEvent, ResourceChange, Transaction } from "../lib/api";

interface OperationCardProps {
    operation: OperationContents;
    transactions?: Transaction[];
}

function parseOperationName(name: string) {
    // Format: "[1] execute 0x6a16...::pool::lend" or "[0] fund (account)"
    const executeMatch = name.match(/execute\s+([^\s]+)/);
    if (executeMatch) {
        const functionId = executeMatch[1] ?? "";
        const parts = functionId.split("::");
        if (parts.length >= 2) {
            const module = parts[parts.length - 2] ?? "";
            const func = parts[parts.length - 1] ?? "";
            const address = parts.slice(0, -2).join("::");
            return { type: "execute" as const, address, module, func, functionId };
        }
        return { type: "execute" as const, address: "", module: "", func: functionId, functionId };
    }

    const fundMatch = name.match(/fund\s+\(([^)]+)\)/);
    if (fundMatch) {
        return { type: "fund" as const, account: fundMatch[1] ?? "" };
    }

    return { type: "unknown" as const };
}

function getEventTypeTag(event: OperationEvent): string {
    if (event.V2) {
        return event.V2.type_tag;
    }
    if (event.V1) {
        return event.V1.type_tag;
    }
    return "Unknown";
}

function shortenType(typeTag: string): string {
    // Shorten long type tags like 0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2::pool::LendEvent
    const parts = typeTag.split("::");
    if (parts.length >= 2) {
        return parts.slice(-2).join("::");
    }
    return typeTag;
}

function shortenAddress(address: string): string {
    if (address.length > 16) {
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
    return address;
}

function parseResourceKey(key: string): { address: string; resourceType: string } {
    // Format: "resource::0x26f1ad9433746c22fe2f59f551a4218e57787683375747793f827a640c28e659::0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    const match = key.match(/^resource::([^:]+)::(.+)$/);
    if (match) {
        return { address: match[1] ?? "", resourceType: match[2] ?? "" };
    }
    return { address: "", resourceType: key };
}

export function OperationCard({ operation, transactions = [] }: OperationCardProps) {
    const [showEvents, setShowEvents] = useState(false);
    const [showWriteSet, setShowWriteSet] = useState(false);
    const [showInputs, setShowInputs] = useState(false);

    const parsed = parseOperationName(operation.name);
    const summary = operation.summary?.execute_transaction;
    const fundData = operation.summary?.fund_fungible;

    // Find matching transaction by functionId (for execute operations)
    const matchedTransaction = parsed.type === "execute" && parsed.functionId
        ? transactions.find(tx => {
            // Match by functionId - the operation name contains an abbreviated version
            // e.g., "0x6a16...::pool::lend" vs "0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2::pool::lend"
            const opFunc = parsed.functionId;
            const txFunc = tx.functionId;
            // Match by module::function suffix
            const opSuffix = opFunc.split("::").slice(-2).join("::");
            const txSuffix = txFunc.split("::").slice(-2).join("::");
            return opSuffix === txSuffix;
        })
        : undefined;

    // Parse status - can be "Success" string or MoveAbort object
    let isSuccess = false;
    let statusText = "Unknown";
    let errorDetails: {
        code: number;
        location?: string;
        reasonName?: string;
        description?: string;
    } | null = null;

    // Handle execute transactions
    if (summary?.status && "Keep" in summary.status) {
        const keepStatus = summary.status.Keep;
        if (keepStatus === "Success") {
            isSuccess = true;
            statusText = "Success";
        } else if (typeof keepStatus === "object" && keepStatus !== null && "MoveAbort" in keepStatus) {
            // Handle MoveAbort: { MoveAbort: { location, code, info: { reason_name, description } } }
            const abort = (keepStatus as {
                MoveAbort: {
                    location?: { Module?: { address: string; name: string } };
                    code: number;
                    info?: { reason_name?: string; description?: string }
                }
            }).MoveAbort;
            statusText = abort.info?.reason_name || `Abort(${abort.code})`;
            isSuccess = false;

            // Store full error details
            errorDetails = {
                code: abort.code,
                location: abort.location?.Module
                    ? `${abort.location.Module.address}::${abort.location.Module.name}`
                    : undefined,
                reasonName: abort.info?.reason_name,
                description: abort.info?.description,
            };
        } else {
            statusText = String(keepStatus);
        }
    } else if (summary?.status && "Abort" in summary.status) {
        statusText = String(summary.status.Abort);
        isSuccess = false;
    } else if (fundData) {
        // Fund operations are always successful if they exist
        isSuccess = true;
        statusText = "Funded";
    }

    const hasEvents = operation.events.length > 0;
    const writeSetKeys = Object.keys(operation.writeSet);
    const hasWriteSet = writeSetKeys.length > 0;
    const hasInputs = matchedTransaction && (
        (matchedTransaction.typeArguments && matchedTransaction.typeArguments.length > 0) ||
        (matchedTransaction.args && matchedTransaction.args.length > 0)
    );

    return (
        <Card
            className={`group transition-all duration-200 hover:shadow-lg ${isSuccess
                ? "hover:border-green-500/50 hover:shadow-green-500/10"
                : "hover:border-red-500/50 hover:shadow-red-500/10"
                }`}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className={`p-2 rounded-lg shrink-0 ${isSuccess
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                                }`}
                        >
                            {isSuccess ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            {parsed.type === "execute" && (
                                <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">{parsed.func}</span>
                                        <Badge variant="secondary" className="text-xs font-mono">
                                            {parsed.module}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                                        {parsed.address ? shortenAddress(parsed.address) : "Unknown"}
                                    </p>
                                </>
                            )}
                            {parsed.type === "fund" && (
                                <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Coins className="w-4 h-4 text-yellow-500" />
                                        <span className="font-semibold text-sm">Fund Account</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                                        {parsed.account}
                                    </p>
                                </>
                            )}
                            {parsed.type === "unknown" && (
                                <span className="font-semibold text-sm">{operation.name}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                            variant={isSuccess ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {statusText}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{operation.index}</span>
                    </div>
                </div>

                {/* Error Details for failed transactions */}
                {errorDetails && (
                    <div className="mt-3 pt-3 border-t bg-red-500/5 -mx-4 px-4 py-2 border-b border-red-500/20">
                        <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1 min-w-0">
                                {errorDetails.description && (
                                    <p className="text-red-400 font-medium">{errorDetails.description}</p>
                                )}
                                <div className="text-muted-foreground space-y-0.5">
                                    <p>
                                        <span className="text-muted-foreground/70">Error Code:</span>{" "}
                                        <span className="font-mono">{errorDetails.code}</span>
                                    </p>
                                    {errorDetails.location && (
                                        <p className="truncate">
                                            <span className="text-muted-foreground/70">Location:</span>{" "}
                                            <span className="font-mono" title={errorDetails.location}>
                                                {shortenType(errorDetails.location)}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                {summary && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5" title="Total Gas">
                            <Fuel className="w-3.5 h-3.5" />
                            <span>{summary.gas_used.toLocaleString()} gas</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Execution Gas">
                            <Zap className="w-3.5 h-3.5 text-yellow-500" />
                            <span>{summary.fee_statement.execution_gas_units} exec</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="IO Gas">
                            <Activity className="w-3.5 h-3.5 text-blue-500" />
                            <span>{summary.fee_statement.io_gas_units} io</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Storage Fee">
                            <Database className="w-3.5 h-3.5 text-purple-500" />
                            <span>{summary.fee_statement.storage_fee_octas} octas</span>
                        </div>
                    </div>
                )}

                {/* Fund Operation Stats */}
                {fundData && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5" title="Amount Funded">
                            <Coins className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="font-medium text-foreground">
                                +{(fundData.amount / 100_000_000).toFixed(2)} MOVE
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Balance Before">
                            <span>Before: {(fundData.before / 100_000_000).toFixed(2)} MOVE</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Balance After">
                            <span>After: {(fundData.after / 100_000_000).toFixed(2)} MOVE</span>
                        </div>
                    </div>
                )}

                {/* Expandable Sections Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    {hasEvents && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEvents(!showEvents);
                            }}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Events ({operation.events.length})
                            {showEvents ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                    )}
                    {hasWriteSet && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowWriteSet(!showWriteSet);
                            }}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Resources ({writeSetKeys.length})
                            {showWriteSet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                    )}
                    {hasInputs && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowInputs(!showInputs);
                            }}
                        >
                            <Code2 className="w-3.5 h-3.5" />
                            Inputs
                            {showInputs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                    )}
                </div>

                {/* Events Section */}
                {showEvents && hasEvents && (
                    <div className="mt-3 pt-3 border-t">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Events
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {operation.events.map((event, idx) => (
                                <div
                                    key={idx}
                                    className="text-xs bg-muted/50 p-2 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs font-mono">
                                            {event.V2 ? "V2" : "V1"}
                                        </Badge>
                                        <span className="font-mono text-primary">
                                            {shortenType(getEventTypeTag(event))}
                                        </span>
                                    </div>
                                    <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(event.V2?.event_data || event.V1?.event_data, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Write Set Section */}
                {showWriteSet && hasWriteSet && (
                    <div className="mt-3 pt-3 border-t">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Resource Changes
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {writeSetKeys.slice(0, 10).map((key) => {
                                const { address, resourceType } = parseResourceKey(key);
                                const change = operation.writeSet[key];
                                const isDelete = change?.delete;

                                return (
                                    <div
                                        key={key}
                                        className="text-xs bg-muted/50 p-2 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                                variant={isDelete ? "destructive" : "default"}
                                                className="text-xs"
                                            >
                                                {isDelete ? "DELETE" : "WRITE"}
                                            </Badge>
                                            <span className="font-mono text-muted-foreground">
                                                {shortenAddress(address)}
                                            </span>
                                        </div>
                                        <p className="font-mono text-primary mt-1 truncate" title={resourceType}>
                                            {shortenType(resourceType)}
                                        </p>
                                        {change?.write && (
                                            <details className="mt-1">
                                                <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                                                    View data
                                                </summary>
                                                <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap bg-background p-2 rounded">
                                                    {JSON.stringify(change.write.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                );
                            })}
                            {writeSetKeys.length > 10 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                    +{writeSetKeys.length - 10} more resources...
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Inputs Section */}
                {showInputs && hasInputs && matchedTransaction && (
                    <div className="mt-3 pt-3 border-t">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" />
                            Input Parameters
                        </h4>
                        <div className="space-y-2">
                            {matchedTransaction.typeArguments && matchedTransaction.typeArguments.length > 0 && (
                                <div className="text-xs bg-muted/50 p-2 rounded-lg">
                                    <div className="text-muted-foreground mb-1 font-medium">Type Arguments:</div>
                                    {matchedTransaction.typeArguments.map((typeArg, idx) => (
                                        <div key={idx} className="font-mono text-primary truncate" title={typeArg}>
                                            {shortenType(typeArg)}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {matchedTransaction.args && matchedTransaction.args.length > 0 && (
                                <div className="text-xs bg-muted/50 p-2 rounded-lg">
                                    <div className="text-muted-foreground mb-1 font-medium">Arguments:</div>
                                    {matchedTransaction.args.map((arg, idx) => (
                                        <div key={idx} className="font-mono text-foreground break-all">
                                            <span className="text-muted-foreground">arg{idx}: </span>
                                            {arg}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
