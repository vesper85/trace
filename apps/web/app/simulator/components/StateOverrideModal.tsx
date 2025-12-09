"use client";

import { useState, useEffect } from "react";
import { StateOverride } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface StateOverrideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValue?: StateOverride;
    onSubmit: (override: Omit<StateOverride, "id">) => void;
}

export function StateOverrideModal({
    open,
    onOpenChange,
    initialValue,
    onSubmit,
}: StateOverrideModalProps) {
    const [address, setAddress] = useState("");
    const [resourceType, setResourceType] = useState("");
    const [value, setValue] = useState("");

    useEffect(() => {
        if (initialValue) {
            setAddress(initialValue.address);
            setResourceType(initialValue.resourceType);
            setValue(initialValue.value);
        } else {
            setAddress("");
            setResourceType("");
            setValue("");
        }
    }, [initialValue, open]);

    const handleSubmit = () => {
        if (!address || !resourceType || !value) return;
        onSubmit({ address, resourceType, value });
    };

    const isValid = address.trim() !== "" && resourceType.trim() !== "" && value.trim() !== "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {initialValue ? "Edit State Override" : "Add State Override"}
                    </DialogTitle>
                    <DialogDescription>
                        Override on-chain state for simulation
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="0x1234..."
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Resource Type</label>
                        <Input
                            value={resourceType}
                            onChange={(e) => setResourceType(e.target.value)}
                            placeholder="0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Value (JSON)</label>
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='{"coin": {"value": "1000000000"}}'
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid}>
                        {initialValue ? "Save Changes" : "Add Override"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
