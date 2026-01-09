"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Clock, Hash, Database } from "lucide-react";
import { SimulationConfig as SimConfigType, StateOverride } from "../types";
import { StateOverrideModal } from "./StateOverrideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SimulationConfigProps {
    value: SimConfigType;
    onChange: (config: SimConfigType) => void;
}

export function SimulationConfig({ value, onChange }: SimulationConfigProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOverride, setEditingOverride] = useState<StateOverride | null>(null);

    const handleAddOverride = (override: Omit<StateOverride, "id">) => {
        const newOverride: StateOverride = {
            ...override,
            id: crypto.randomUUID(),
        };
        onChange({
            ...value,
            stateOverrides: [...value.stateOverrides, newOverride],
        });
        setModalOpen(false);
    };

    const handleEditOverride = (override: Omit<StateOverride, "id">) => {
        if (!editingOverride) return;
        onChange({
            ...value,
            stateOverrides: value.stateOverrides.map((o) =>
                o.id === editingOverride.id ? { ...override, id: o.id } : o
            ),
        });
        setEditingOverride(null);
        setModalOpen(false);
    };

    const handleDeleteOverride = (id: string) => {
        onChange({
            ...value,
            stateOverrides: value.stateOverrides.filter((o) => o.id !== id),
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">Simulation Config</h2>
                <p className="text-xs text-muted-foreground">Advanced simulation options</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Block Number */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        Block Number
                    </label>
                    <Input
                        type="number"
                        value={value.blockNumber || ""}
                        onChange={(e) => onChange({ ...value, blockNumber: e.target.value })}
                        placeholder="Latest"
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Pin simulation to a specific block (leave empty for latest)
                    </p>
                </div>

                {/* Timestamp Override */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Timestamp Override
                    </label>
                    <Input
                        type="number"
                        value={value.timestampOverride || ""}
                        onChange={(e) => onChange({ ...value, timestampOverride: e.target.value })}
                        placeholder="Current timestamp"
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        Override block timestamp (Unix seconds)
                    </p>
                </div>

                {/* State Overrides */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            State Overrides
                        </label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEditingOverride(null);
                                setModalOpen(true);
                            }}
                            className="h-7 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                        </Button>
                    </div>

                    {value.stateOverrides.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic py-6 text-center bg-muted/30 rounded-lg border border-dashed">
                            No state overrides configured
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {value.stateOverrides.map((override) => (
                                <div
                                    key={override.id}
                                    className="p-3 rounded-lg border bg-muted/30"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-xs text-muted-foreground truncate">
                                                {override.address}
                                            </p>
                                            <Badge variant="secondary" className="text-xs font-mono mt-1">
                                                {override.resourceType}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => {
                                                    setEditingOverride(override);
                                                    setModalOpen(true);
                                                }}
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteOverride(override.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <StateOverrideModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initialValue={editingOverride || undefined}
                onSubmit={editingOverride ? handleEditOverride : handleAddOverride}
            />
        </div>
    );
}
