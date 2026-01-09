"use client";

import { useState } from "react";
import { Wallet, Copy, Check, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fundAccount, type SessionConfig } from "../lib/api";

interface AccountCardProps {
    address: string;
    balance: number;
    session: SessionConfig;
    onFundSuccess: () => void;
    onError: (error: string) => void;
}

function formatBalance(octas: number): string {
    const apt = octas / 100_000_000;
    return apt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function shortenAddress(address: string): string {
    if (address.length > 20) {
        return `${address.slice(0, 10)}...${address.slice(-8)}`;
    }
    return address;
}

export function AccountCard({ address, balance, session, onFundSuccess, onError }: AccountCardProps) {
    const [copied, setCopied] = useState(false);
    const [isFunding, setIsFunding] = useState(false);
    const [showFundForm, setShowFundForm] = useState(false);
    const [fundAmount, setFundAmount] = useState("1");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for non-secure contexts
        }
    };

    const handleFund = async () => {
        setIsFunding(true);
        try {
            const amountInOctas = Math.floor(parseFloat(fundAmount) * 100_000_000);
            if (isNaN(amountInOctas) || amountInOctas <= 0) {
                onError("Invalid amount");
                return;
            }

            const result = await fundAccount(session.id, {
                account: address,
                amount: amountInOctas,
            });

            if (!result.success) {
                throw new Error(result.error || "Failed to fund account");
            }

            setShowFundForm(false);
            setFundAmount("1");
            onFundSuccess();
        } catch (err) {
            onError(err instanceof Error ? err.message : "Failed to fund account");
        } finally {
            setIsFunding(false);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Default Account
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Address */}
                <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono bg-muted px-2 py-1.5 rounded truncate">
                        {shortenAddress(address)}
                    </code>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={handleCopy}
                        title="Copy address"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>

                {/* Balance */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <div className="flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{formatBalance(balance)} MOVE</span>
                    </div>
                </div>

                {/* Fund Form */}
                {showFundForm ? (
                    <div className="space-y-2 pt-2 border-t">
                        <Label htmlFor="fundAmount" className="text-xs">
                            Amount (MOVE)
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="fundAmount"
                                type="number"
                                step="0.1"
                                min="0.01"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="1.0"
                            />
                            <Button
                                size="sm"
                                className="h-8"
                                onClick={handleFund}
                                disabled={isFunding}
                            >
                                {isFunding ? "..." : "Fund"}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => setShowFundForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowFundForm(true)}
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        Fund Account
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
