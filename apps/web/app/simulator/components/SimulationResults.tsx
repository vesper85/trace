"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Flame, FileCode, Loader2 } from "lucide-react";
import { SimulationResult } from "../types";
import { AssetChanges } from "./AssetChanges";
import { EventsLog } from "./EventsLog";
import { ExecutionTrace } from "./ExecutionTrace";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationResultsProps {
    result: SimulationResult | null;
    error: string | null;
    isLoading: boolean;
}

export function SimulationResults({ result, error, isLoading }: SimulationResultsProps) {
    const [activeTab, setActiveTab] = useState("assets");

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b">
                    <h2 className="font-semibold">Simulation Results</h2>
                    <p className="text-xs text-muted-foreground">Transaction simulation output</p>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Simulating transaction...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b">
                    <h2 className="font-semibold">Simulation Results</h2>
                    <p className="text-xs text-muted-foreground">Transaction simulation output</p>
                </div>
                <div className="flex-1 p-4">
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-destructive" />
                            <span className="font-semibold text-destructive">Simulation Error</span>
                        </div>
                        <p className="text-sm text-destructive/80 font-mono break-all">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b">
                    <h2 className="font-semibold">Simulation Results</h2>
                    <p className="text-xs text-muted-foreground">Transaction simulation output</p>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <FileCode className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No simulation results yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Configure and run a simulation to see results
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">Simulation Results</h2>
                        <p className="text-xs text-muted-foreground">Transaction simulation output</p>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"} className="gap-1">
                        {result.success ? (
                            <>
                                <CheckCircle className="h-3 w-3" />
                                Success
                            </>
                        ) : (
                            <>
                                <XCircle className="h-3 w-3" />
                                Reverted
                            </>
                        )}
                    </Badge>
                </div>

                {/* Gas Info */}
                <div className="flex items-center gap-4 p-2.5 rounded-lg bg-muted text-sm">
                    <div className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Gas:</span>
                        <span className="font-mono">{result.gasUsed.toLocaleString()}</span>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-mono text-muted-foreground">{result.gasLimit.toLocaleString()}</span>
                </div>

                {/* VM Status */}
                {!result.success && result.vmStatus && (
                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs font-mono text-destructive">{result.vmStatus}</p>
                    </div>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-4 border-b">
                    <TabsList className="h-9 p-0 bg-transparent w-full justify-start">
                        <TabsTrigger value="assets" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            Assets ({result.assetChanges.length})
                        </TabsTrigger>
                        <TabsTrigger value="events" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            Events ({result.events.length})
                        </TabsTrigger>
                        <TabsTrigger value="trace" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            Trace
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                            Raw
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto">
                    <TabsContent value="assets" className="m-0 p-4">
                        <AssetChanges changes={result.assetChanges} />
                    </TabsContent>
                    <TabsContent value="events" className="m-0 p-4">
                        <EventsLog events={result.events} />
                    </TabsContent>
                    <TabsContent value="trace" className="m-0 p-4">
                        <ExecutionTrace trace={result.trace} />
                    </TabsContent>
                    <TabsContent value="raw" className="m-0 p-4">
                        <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-[300px]">
                            {JSON.stringify(result.rawResponse, null, 2)}
                        </pre>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
