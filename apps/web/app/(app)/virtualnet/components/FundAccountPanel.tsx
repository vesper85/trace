"use client";

import { useState } from "react";
import { Coins, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { fundAccount, type SessionConfig } from "../lib/api";

interface FundAccountPanelProps {
    session: SessionConfig | null;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export function FundAccountPanel({
    session,
    onSuccess,
    onError,
}: FundAccountPanelProps) {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState("100000000"); // 1 MOVE in Octa
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    async function handleFund() {
        if (!session) {
            onError("No session selected");
            return;
        }

        if (!account) {
            onError("Account address required");
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fundAccount(session.id, {
                account,
                amount: parseInt(amount),
            });

            if (response.success) {
                setResult({
                    success: true,
                    message: `Funded ${response.account} with ${(response.amount / 100_000_000).toFixed(2)} MOVE. Balance: ${(response.after / 100_000_000).toFixed(2)} MOVE`,
                });
                onSuccess();
            } else {
                throw new Error(response.error || "Failed to fund account");
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Failed to fund account";
            setResult({
                success: false,
                message: errorMsg,
            });
            onError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    // Convert Octa to MOVE for display
    const moveAmount = parseInt(amount || "0") / 100_000_000;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-base">Fund Account</CardTitle>
                </div>
                <CardDescription>
                    Add MOVE to an account in the fork session
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fundAccount">Account Address</Label>
                    <Input
                        id="fundAccount"
                        placeholder="0x..."
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        disabled={!session || isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Octa)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="100000000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!session || isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                        ≈ {moveAmount.toFixed(2)} MOVE (1 MOVE = 100,000,000 Octa)
                    </p>
                </div>
                <Button
                    className="w-full"
                    onClick={handleFund}
                    disabled={!session || !account || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Funding...
                        </>
                    ) : (
                        <>
                            <Coins className="w-4 h-4 mr-2" />
                            Fund Account
                        </>
                    )}
                </Button>

                {result && (
                    <div
                        className={`flex items-start gap-2 p-3 rounded-lg ${result.success
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        {result.success ? (
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm">{result.message}</p>
                    </div>
                )}

                {!session && (
                    <p className="text-sm text-muted-foreground text-center">
                        Select a session to fund accounts
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
