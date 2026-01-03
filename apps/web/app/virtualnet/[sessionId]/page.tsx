"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Send,
    RefreshCw,
    Loader2,
    Server,
    Activity,
    Wallet,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionCard, type Transaction } from "../components/TransactionCard";
import { SendTransactionModal, type TransactionResult } from "../components/SendTransactionModal";
import { FundAccountPanel } from "../components/FundAccountPanel";
import {
    getSession,
    type SessionConfig,
    type SessionDetail,
} from "../lib/api";

interface SessionPageProps {
    params: Promise<{ sessionId: string }>;
}

function getNetworkBadgeColor(network: string) {
    switch (network) {
        case "movement-mainnet":
            return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30";
        case "movement-testnet":
            return "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30";
        default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
}

export default function SessionPage({ params }: SessionPageProps) {
    const router = useRouter();
    const { sessionId } = use(params);

    const [session, setSession] = useState<SessionConfig | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    // Load session on mount
    useEffect(() => {
        loadSession();
    }, [sessionId]);

    async function loadSession() {
        setIsLoading(true);
        setError(null);
        try {
            const detail = await getSession(sessionId);
            setSession(detail.config);

            // Parse operations into transactions if available
            if (detail.operations && detail.operations.length > 0) {
                const txs = detail.operations.map((op, index) => {
                    // Try to parse operation if it's JSON
                    let parsed: any = {};
                    try {
                        parsed = typeof op === 'string' ? JSON.parse(op) : op;
                    } catch {
                        parsed = { raw: op };
                    }

                    return {
                        id: `tx-${index}`,
                        functionId: parsed.functionId || parsed.function || `Operation ${index + 1}`,
                        sender: parsed.sender || "unknown",
                        success: parsed.success !== false,
                        status: parsed.status || "Executed",
                        gasUsed: parsed.gasUsed || 0,
                        timestamp: parsed.timestamp || new Date().toISOString(),
                    } as Transaction;
                });
                setTransactions(txs);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load session");
        } finally {
            setIsLoading(false);
        }
    }

    const handleTransactionSuccess = (result: TransactionResult) => {
        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            functionId: result.functionId,
            sender: result.sender,
            success: result.success,
            status: result.status,
            gasUsed: result.gasUsed,
            timestamp: result.timestamp,
            typeArguments: result.typeArguments,
            args: result.args,
        };
        setTransactions(prev => [newTx, ...prev]);

        // Refresh session to get updated ops count
        loadSession();
    };

    const handleTransactionError = (error: string) => {
        setError(error);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading session...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Session not found</p>
                    <Button onClick={() => router.push("/virtualnet")}>
                        Back to Sessions
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/virtualnet")}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                                    <Server className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">
                                        {session.name || `Session ${session.id.slice(0, 8)}`}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getNetworkBadgeColor(
                                                session.network
                                            )}`}
                                        >
                                            {session.network.replace("movement-", "")}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {session.id.slice(0, 12)}...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={loadSession}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => setIsSendModalOpen(true)}
                                className="gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Transaction
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="container mx-auto px-6 mt-4">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                        <span className="text-sm">{error}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 px-2"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transactions List - Main Area */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Transactions
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {transactions.length} total
                            </span>
                        </div>

                        {transactions.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                                        <Send className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                                    <p className="text-muted-foreground max-w-sm mb-6">
                                        Start simulating transactions on this fork to see them appear here.
                                    </p>
                                    <Button
                                        onClick={() => setIsSendModalOpen(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Send First Transaction
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx) => (
                                    <TransactionCard key={tx.id} transaction={tx} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Session Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Session Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Operations</span>
                                    <span className="font-medium">{session.ops}</span>
                                </div>
                                {session.networkVersion && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Ledger Version</span>
                                        <span className="font-mono">{session.networkVersion}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fund Account */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Fund Account
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FundAccountPanel
                                    session={session}
                                    onSuccess={loadSession}
                                    onError={handleTransactionError}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Send Transaction Modal */}
            <SendTransactionModal
                open={isSendModalOpen}
                onOpenChange={setIsSendModalOpen}
                session={session}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
            />
        </div>
    );
}
