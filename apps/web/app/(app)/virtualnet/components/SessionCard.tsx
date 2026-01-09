"use client";

import { useRouter } from "next/navigation";
import { Server, Activity, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SessionConfig } from "../lib/api";

interface SessionCardProps {
    session: SessionConfig;
    onDelete: (sessionId: string) => void;
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

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/virtualnet/${session.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(session.id);
    };

    return (
        <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80"
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Server className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                                {session.name || `Session ${session.id.slice(0, 8)}`}
                            </h3>
                            <span
                                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getNetworkBadgeColor(
                                    session.network
                                )}`}
                            >
                                {session.network.replace("movement-", "").charAt(0).toUpperCase() +
                                    session.network.replace("movement-", "").slice(1)}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        <span className="font-medium">{session.ops}</span>
                        <span>transactions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.createdAt)}</span>
                    </div>
                </div>
                {session.networkVersion && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Ledger v{session.networkVersion}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
