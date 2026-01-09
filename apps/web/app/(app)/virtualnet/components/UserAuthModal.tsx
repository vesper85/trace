"use client";

import { useState } from "react";
import { User, Copy, Check, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserAuthModalProps {
    isOpen: boolean;
    onCreateUser: () => void;
    onLogin: (userId: string) => boolean;
    newUserId?: string;
}

export function UserAuthModal({
    isOpen,
    onCreateUser,
    onLogin,
    newUserId,
}: UserAuthModalProps) {
    const [loginUserId, setLoginUserId] = useState("");
    const [loginError, setLoginError] = useState<string | null>(null);
    const [showNewUserSuccess, setShowNewUserSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    function handleCreateUser() {
        onCreateUser();
        setShowNewUserSuccess(true);
    }

    function handleLogin() {
        if (!loginUserId.trim()) {
            setLoginError("Please enter your user ID");
            return;
        }
        const success = onLogin(loginUserId);
        if (!success) {
            setLoginError("Invalid user ID format. Please enter a valid UUID.");
        }
    }

    async function copyToClipboard() {
        if (newUserId) {
            await navigator.clipboard.writeText(newUserId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    // Show success screen after creating a new user
    if (showNewUserSuccess && newUserId) {
        return (
            <Dialog open={isOpen}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-green-500/20">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                            Account Created!
                        </DialogTitle>
                        <DialogDescription>
                            Your account has been created. Save your User ID to sign in later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="p-4 rounded-lg bg-muted/50 border">
                            <Label className="text-xs text-muted-foreground">Your User ID</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 font-mono text-sm break-all">
                                    {newUserId}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyToClipboard}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <span className="text-yellow-500 text-sm">⚠️</span>
                            <p className="text-sm text-yellow-500/90">
                                Save this ID! You&apos;ll need it to access your sessions later.
                            </p>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => setShowNewUserSuccess(false)}
                        >
                            Continue to VirtualNet
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/20">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        Welcome to VirtualNet
                    </DialogTitle>
                    <DialogDescription>
                        Create a new account or sign in with your existing User ID to access your sessions.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="new" className="pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new" className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            New User
                        </TabsTrigger>
                        <TabsTrigger value="login" className="gap-2">
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="new" className="space-y-4 pt-4">
                        <p className="text-sm text-muted-foreground">
                            Create a new account to start using VirtualNet. You&apos;ll receive a unique User ID
                            that you can use to access your sessions from any device.
                        </p>
                        <Button className="w-full gap-2" onClick={handleCreateUser}>
                            <UserPlus className="w-4 h-4" />
                            Create New Account
                        </Button>
                    </TabsContent>

                    <TabsContent value="login" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx"
                                value={loginUserId}
                                onChange={(e) => {
                                    setLoginUserId(e.target.value);
                                    setLoginError(null);
                                }}
                                className="font-mono text-sm"
                            />
                            {loginError && (
                                <p className="text-sm text-destructive">{loginError}</p>
                            )}
                        </div>
                        <Button
                            className="w-full gap-2"
                            onClick={handleLogin}
                            disabled={!loginUserId.trim()}
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
