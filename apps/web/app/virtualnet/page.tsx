"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Server, Loader2 } from "lucide-react";
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
import { SessionCard } from "./components/SessionCard";
import {
    listSessions,
    initSession,
    deleteSession,
    type SessionConfig,
    type InitSessionParams,
} from "./lib/api";

export default function VirtualnetPage() {
    const [sessions, setSessions] = useState<SessionConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state for new session
    const [sessionName, setSessionName] = useState("");
    const [network, setNetwork] = useState<InitSessionParams["network"]>("movement-mainnet");
    const [apiKey, setApiKey] = useState("");
    const [networkVersion, setNetworkVersion] = useState("");

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {
        setIsLoading(true);
        setError(null);
        try {
            const response = await listSessions();
            setSessions(response.sessions);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load sessions");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateSession() {
        if (!sessionName.trim()) {
            setError("Please enter a session name");
            return;
        }

        setIsCreating(true);
        setError(null);
        try {
            const params: InitSessionParams = {
                name: sessionName.trim(),
                network,
                apiKey: apiKey || undefined,
                networkVersion: networkVersion ? parseInt(networkVersion) : undefined,
            };

            const response = await initSession(params);

            if (!response.success) {
                throw new Error(response.error || "Failed to create session");
            }

            // Reset form and close dialog
            setSessionName("");
            setNetwork("movement-mainnet");
            setApiKey("");
            setNetworkVersion("");
            setIsDialogOpen(false);

            // Reload sessions
            await loadSessions();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create session");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDeleteSession(sessionId: string) {
        try {
            await deleteSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete session");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                                <Server className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    VirtualNet
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Simulate transactions on mainnet forks
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
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
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        New Session
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Create New Session</DialogTitle>
                                        <DialogDescription>
                                            Fork a network to simulate transactions with custom state.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sessionName">Session Name</Label>
                                            <Input
                                                id="sessionName"
                                                placeholder="My DeFi Test"
                                                value={sessionName}
                                                onChange={(e) => setSessionName(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
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
                                                    <SelectItem value="movement-mainnet">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                                            Movement Mainnet
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="movement-testnet">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                                                            Movement Testnet
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apiKey">API Key (optional)</Label>
                                            <Input
                                                id="apiKey"
                                                placeholder="Your API key"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Recommended to avoid rate limiting
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="version">Ledger Version (optional)</Label>
                                            <Input
                                                id="version"
                                                placeholder="Latest"
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
                                            disabled={isCreating || !sessionName.trim()}
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create Session"
                                            )}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading sessions...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                            <Server className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Sessions Yet</h2>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Create your first fork session to start simulating transactions
                            on a mainnet fork with custom state modifications.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Your First Session
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onDelete={handleDeleteSession}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
