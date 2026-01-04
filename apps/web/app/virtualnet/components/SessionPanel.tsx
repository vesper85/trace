"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    RefreshCw,
    Server,
    Activity,
    Wallet,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    listSessions,
    initSession,
    deleteSession,
    type SessionConfig,
    type InitSessionParams,
} from "../lib/api";

interface SessionPanelProps {
    selectedSession: SessionConfig | null;
    onSessionSelect: (session: SessionConfig | null) => void;
    onError: (error: string) => void;
}

export function SessionPanel({
    selectedSession,
    onSessionSelect,
    onError,
}: SessionPanelProps) {
    const [sessions, setSessions] = useState<SessionConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state for new session
    const [network, setNetwork] = useState<InitSessionParams["network"]>("movement-testnet");
    const [apiKey, setApiKey] = useState("");
    const [networkVersion, setNetworkVersion] = useState("");

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {
        setIsLoading(true);
        try {
            const response = await listSessions();
            setSessions(response.sessions);

            // Auto-select first session if none selected
            if (!selectedSession && response.sessions.length > 0) {
                onSessionSelect(response.sessions[0] ?? null);
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to load sessions");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateSession() {
        setIsCreating(true);
        try {
            const params: InitSessionParams = {
                network,
                apiKey: apiKey || undefined,
                networkVersion: networkVersion ? parseInt(networkVersion) : undefined,
            };

            const response = await initSession(params);

            if (!response.success) {
                throw new Error(response.error || "Failed to create session");
            }

            // Reload sessions and select the new one
            await loadSessions();
            if (response.config) {
                onSessionSelect(response.config);
            }

            setIsDialogOpen(false);
            setNetwork("movement-testnet");
            setApiKey("");
            setNetworkVersion("");
        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to create session");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDeleteSession(sessionId: string) {
        try {
            await deleteSession(sessionId);

            // If deleting selected session, clear selection
            if (selectedSession?.id === sessionId) {
                onSessionSelect(null);
            }

            await loadSessions();
        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to delete session");
        }
    }

    function getNetworkBadgeColor(network: string) {
        switch (network) {
            case "movement-mainnet":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "movement-testnet":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-semibold">Fork Sessions</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={loadSessions}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                New Fork
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Fork Session</DialogTitle>
                                <DialogDescription>
                                    Fork from a remote Aptos network to simulate transactions locally.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="network">Network</Label>
                                    <Select
                                        value={network}
                                        onValueChange={(v) => setNetwork(v as InitSessionParams["network"])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="movement-mainnet">Movement Mainnet</SelectItem>
                                            <SelectItem value="movement-testnet">Movement Testnet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey">API Key (optional)</Label>
                                    <Input
                                        id="apiKey"
                                        placeholder="Your Aptos API key"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Recommended to avoid rate limiting
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="version">Network Version (optional)</Label>
                                    <Input
                                        id="version"
                                        placeholder="Latest version"
                                        value={networkVersion}
                                        onChange={(e) => setNetworkVersion(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Pin to a specific ledger version
                                    </p>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleCreateSession}
                                    disabled={isCreating}
                                >
                                    {isCreating ? "Creating..." : "Create Fork"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-auto p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No sessions yet</p>
                        <p className="text-xs text-muted-foreground">
                            Create a fork to get started
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSession?.id === session.id
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-muted/50"
                                    }`}
                                onClick={() => onSessionSelect(session)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded border ${getNetworkBadgeColor(
                                                session.network
                                            )}`}
                                        >
                                            {session.network}
                                        </span>
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {session.id.slice(0, 15)}...
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSession(session.id);
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        {session.ops} ops
                                    </div>
                                    {session.networkVersion && (
                                        <div>v{session.networkVersion}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
