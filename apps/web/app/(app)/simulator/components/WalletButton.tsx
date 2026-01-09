"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function WalletButton() {
    const { account, connected, connect, disconnect, wallets } = useWallet();
    const [open, setOpen] = useState(false);

    if (connected && account) {
        const addressStr = account.address.toString();
        const shortAddress = `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Wallet className="h-4 w-4" />
                        {shortAddress}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Wallet Connected</DialogTitle>
                        <DialogDescription className="font-mono text-xs break-all">
                            {addressStr}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button
                            variant="destructive"
                            onClick={() => disconnect()}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Disconnect
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                    <DialogDescription>
                        Select a wallet to connect to Movement Network
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    {wallets && wallets.length > 0 ? (
                        wallets.map((wallet) => (
                            <Button
                                key={wallet.name}
                                variant="outline"
                                className="justify-start gap-3 h-12"
                                onClick={() => {
                                    connect(wallet.name);
                                    setOpen(false);
                                }}
                            >
                                {wallet.icon && (
                                    <img
                                        src={wallet.icon}
                                        alt={wallet.name}
                                        className="h-6 w-6 rounded"
                                    />
                                )}
                                {wallet.name}
                            </Button>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No wallets detected. Please install a wallet extension.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
