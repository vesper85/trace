"use client";

import { FunctionSquare, Zap, Edit } from "lucide-react";
import { TraceNode } from "../types";

interface ExecutionTraceProps {
    trace: TraceNode;
}

function TraceNodeComponent({ node, depth = 0 }: { node: TraceNode; depth?: number }) {
    const getIcon = () => {
        switch (node.type) {
            case "function":
                return <FunctionSquare className="h-4 w-4 text-blue-500" />;
            case "event":
                return <Zap className="h-4 w-4 text-amber-500" />;
            case "write":
                return <Edit className="h-4 w-4 text-green-500" />;
            default:
                return <FunctionSquare className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-1">
            <div
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                style={{ marginLeft: `${depth * 16}px` }}
            >
                {getIcon()}
                <span className="font-mono text-sm">{node.name}</span>
                {node.gasUsed !== undefined && (
                    <span className="text-xs text-muted-foreground">
                        ({node.gasUsed} gas)
                    </span>
                )}
            </div>
            {node.children.map((child, index) => (
                <TraceNodeComponent key={index} node={child} depth={depth + 1} />
            ))}
        </div>
    );
}

export function ExecutionTrace({ trace }: ExecutionTraceProps) {
    return (
        <div className="p-2 rounded-lg border bg-card">
            <TraceNodeComponent node={trace} />
        </div>
    );
}
