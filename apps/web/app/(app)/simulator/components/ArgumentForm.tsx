"use client";

import { useState, useEffect, useCallback } from "react";
import { FunctionArgument } from "../types";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ArgumentFormProps {
    functionSignature: string;
    onChange: (args: FunctionArgument[]) => void;
}

function parseArgumentTypes(signature: string): { name: string; type: string }[] {
    const argsMatch = signature.match(/\(([^)]*)\)/);
    if (!argsMatch) return [];

    const argsString = argsMatch[1];
    if (!argsString || !argsString.trim()) return [];

    return argsString.split(",").map((arg, index) => {
        const parts = arg.trim().split(":");
        if (parts.length === 2 && parts[0] && parts[1]) {
            return { name: parts[0].trim(), type: parts[1].trim() };
        }
        return { name: `arg${index}`, type: arg.trim() || "unknown" };
    });
}

function getInputType(argType: string): "number" | "text" | "hex" {
    if (argType.includes("u64") || argType.includes("u128") || argType.includes("u8") || argType.includes("u16") || argType.includes("u32")) {
        return "number";
    }
    if (argType.includes("vector<u8>") || argType.includes("bytes")) {
        return "hex";
    }
    return "text";
}

function getPlaceholder(argType: string, inputType: string): string {
    if (inputType === "number") return "0";
    if (inputType === "hex") return "0x...";
    if (argType.includes("address")) return "0x1234...";
    return "Enter value";
}

export function ArgumentForm({ functionSignature, onChange }: ArgumentFormProps) {
    const [args, setArgs] = useState<FunctionArgument[]>([]);

    useEffect(() => {
        const parsed = parseArgumentTypes(functionSignature);
        const newArgs = parsed.map((p) => ({
            name: p.name,
            type: p.type,
            value: "",
        }));
        setArgs(newArgs);
        onChange(newArgs);
    }, [functionSignature, onChange]);

    const updateArg = (index: number, value: string) => {
        const newArgs = [...args];
        const existingArg = newArgs[index];
        if (existingArg) {
            newArgs[index] = { ...existingArg, value };
            setArgs(newArgs);
            onChange(newArgs);
        }
    };

    if (args.length === 0) {
        return (
            <div className="text-sm text-muted-foreground italic py-4 text-center bg-muted/50 rounded-lg border border-dashed">
                No arguments required
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {args.map((arg, index) => {
                const inputType = getInputType(arg.type);
                return (
                    <div key={index} className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <span>{arg.name}</span>
                            <Badge variant="secondary" className="text-xs font-mono">
                                {arg.type}
                            </Badge>
                        </label>
                        <Input
                            type={inputType === "number" ? "number" : "text"}
                            value={arg.value}
                            onChange={(e) => updateArg(index, e.target.value)}
                            placeholder={getPlaceholder(arg.type, inputType)}
                            className="font-mono text-sm"
                        />
                    </div>
                );
            })}
        </div>
    );
}

interface TypeArgumentsFormProps {
    value: string[];
    onChange: (args: string[]) => void;
}

export function TypeArgumentsForm({ value, onChange }: TypeArgumentsFormProps) {
    const addTypeArg = () => {
        onChange([...value, ""]);
    };

    const removeTypeArg = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const updateTypeArg = (index: number, newValue: string) => {
        const updated = [...value];
        updated[index] = newValue;
        onChange(updated);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Type Arguments (Generics)</label>
                <Button variant="ghost" size="sm" onClick={addTypeArg} className="h-7 px-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>

            {value.length === 0 ? (
                <div className="text-sm text-muted-foreground italic py-2">
                    No type arguments
                </div>
            ) : (
                <div className="space-y-2">
                    {value.map((arg, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={arg}
                                onChange={(e) => updateTypeArg(index, e.target.value)}
                                placeholder="e.g., 0x1::aptos_coin::AptosCoin"
                                className="font-mono text-sm"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTypeArg(index)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
