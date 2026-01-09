"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { AssetChange } from "../types";
import { Badge } from "@/components/ui/badge";

interface AssetChangesProps {
    changes: AssetChange[];
}

export function AssetChanges({ changes }: AssetChangesProps) {
    if (changes.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No asset changes detected
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {changes.map((change, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg ${change.direction === "in"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                }`}
                        >
                            {change.direction === "in" ? (
                                <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                                <ArrowUpRight className="h-4 w-4" />
                            )}
                        </div>
                        <div>
                            <p className="font-mono text-sm truncate max-w-[200px]">
                                {change.address}
                            </p>
                            <Badge variant="secondary" className="text-xs mt-1">
                                {change.asset}
                            </Badge>
                        </div>
                    </div>
                    <div
                        className={`text-right font-mono font-medium ${change.direction === "in"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                    >
                        {change.direction === "in" ? "+" : "-"}
                        {change.amount}
                    </div>
                </div>
            ))}
        </div>
    );
}
