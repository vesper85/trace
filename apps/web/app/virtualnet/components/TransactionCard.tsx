"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Fuel, Clock, Code2, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Transaction {
    id: string;
    functionId: string;
    sender: string;
    success: boolean;
    status: string;
    gasUsed: number;
    timestamp: string;
    typeArguments?: string[];
    args?: string[];
    vmStatus?: string;
    rawOutput?: string;
}

interface TransactionCardProps {
    transaction: Transaction;
    onClick?: () => void;
}

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

function parseFunctionId(functionId: string) {
    const parts = functionId.split("::");
    if (parts.length >= 3) {
        const address = parts[0];
        const module = parts[1];
        const func = parts.slice(2).join("::");
        return { address, module, func };
    }
    return { address: "", module: "", func: functionId };
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
    const { address, module, func } = parseFunctionId(transaction.functionId);
    const [showOutput, setShowOutput] = useState(false);
    const hasOutput = transaction.rawOutput && transaction.rawOutput.trim().length > 0;

    return (
        <Card
            className={`group transition-all duration-200 hover:shadow-lg ${transaction.success
                ? "hover:border-green-500/50 hover:shadow-green-500/10"
                : "hover:border-red-500/50 hover:shadow-red-500/10"
                }`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={onClick}>
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className={`p-2 rounded-lg shrink-0 ${transaction.success
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                                }`}
                        >
                            {transaction.success ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{func}</span>
                                <Badge variant="secondary" className="text-xs font-mono">
                                    {module}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                                {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Unknown'}
                            </p>
                            {transaction.vmStatus && transaction.vmStatus !== 'Executed' && (
                                <p className={`text-xs mt-1 ${transaction.success ? 'text-green-500' : 'text-red-500'}`}>
                                    {transaction.vmStatus}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                            variant={transaction.success ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {transaction.success ? "Success" : "Failed"}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5" />
                        <span>{transaction.gasUsed.toLocaleString()} gas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimestamp(transaction.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        <span className="font-mono">
                            {transaction.sender.slice(0, 6)}...
                        </span>
                    </div>
                    {hasOutput && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 px-2 text-xs gap-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowOutput(!showOutput);
                            }}
                        >
                            <Terminal className="w-3 h-3" />
                            Output
                            {showOutput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                    )}
                </div>

                {/* CLI Output Section */}
                {showOutput && hasOutput && (
                    <div className="mt-3 pt-3 border-t">
                        <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {transaction.rawOutput}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
