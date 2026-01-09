"use client";

import { X, CheckCircle2, XCircle, Fuel, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimulationResult } from "../types";
import { useState } from "react";

interface SimulationResultsPanelProps {
    result: SimulationResult | null;
    error: string | null;
    onClose: () => void;
}

export function SimulationResultsPanel({
    result,
    error,
    onClose,
}: SimulationResultsPanelProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showChanges, setShowChanges] = useState(false);

    if (error) {
        return (
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-destructive" />
                        <h3 className="font-semibold text-destructive">Simulation Failed</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-mono">{error}</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {result.success ? (
                        <>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold text-green-500">Simulation Successful</h3>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-5 h-5 text-destructive" />
                            <h3 className="font-semibold text-destructive">Simulation Failed</h3>
                        </>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Fuel className="w-4 h-4" />
                        <span className="text-xs">Gas Used</span>
                    </div>
                    <p className="font-mono font-semibold">{result.gasUsed.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Gas Price</span>
                    </div>
                    <p className="font-mono font-semibold">{result.gasUnitPrice}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Fuel className="w-4 h-4" />
                        <span className="text-xs">Max Gas</span>
                    </div>
                    <p className="font-mono font-semibold">{result.maxGasAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="text-muted-foreground text-xs mb-1">Events</div>
                    <p className="font-mono font-semibold">{result.events.length}</p>
                </div>
            </div>

            {/* VM Status */}
            {!result.success && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                    <p className="text-sm font-medium text-destructive mb-1">VM Status</p>
                    <p className="text-sm text-destructive font-mono">{result.vmStatus}</p>
                </div>
            )}

            {/* Events Section */}
            {result.events.length > 0 && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowEvents(!showEvents)}
                        className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
                    >
                        <span className="font-medium text-sm">
                            Events ({result.events.length})
                        </span>
                        {showEvents ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                    {showEvents && (
                        <div className="mt-2 space-y-2">
                            {result.events.map((event, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-lg bg-muted/20 border text-sm"
                                >
                                    <p className="font-mono text-xs text-muted-foreground mb-1">
                                        {event.type}
                                    </p>
                                    <pre className="text-xs font-mono overflow-x-auto">
                                        {JSON.stringify(event.data, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Changes Section */}
            {result.changes.length > 0 && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowChanges(!showChanges)}
                        className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
                    >
                        <span className="font-medium text-sm">
                            State Changes ({result.changes.length})
                        </span>
                        {showChanges ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                    {showChanges && (
                        <div className="mt-2 p-3 rounded-lg bg-muted/20 border">
                            <pre className="text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                                {JSON.stringify(result.changes, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {/* Raw Response */}
            <div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors"
                >
                    <span className="font-medium text-sm">Raw Response</span>
                    {showDetails ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
                {showDetails && (
                    <div className="mt-2 p-3 rounded-lg bg-muted/20 border">
                        <pre className="text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            {JSON.stringify(result.rawResponse, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
