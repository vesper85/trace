"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
    NETWORKS,
    NetworkType,
    TransactionPayload,
    SimulationState,
    SimulationResult,
    AssetChange,
    TraceNode,
} from "../types";

export function useSimulation() {
    const { account } = useWallet();
    const [state, setState] = useState<SimulationState>({
        isLoading: false,
        error: null,
        result: null,
    });

    const simulate = useCallback(
        async (network: NetworkType, payload: TransactionPayload) => {
            setState({ isLoading: true, error: null, result: null });

            try {
                if (!account) {
                    throw new Error("Please connect your wallet first");
                }

                const networkConfig = NETWORKS[network];
                const config = new AptosConfig({
                    network: Network.CUSTOM,
                    fullnode: networkConfig.fullnode,
                });
                const aptos = new Aptos(config);

                // Use connected wallet's address if sender matches or override with payload sender
                const senderAddress = payload.sender || account.address;

                // Build the transaction
                const transaction = await aptos.transaction.build.simple({
                    sender: senderAddress,
                    data: {
                        function: payload.function as `${string}::${string}::${string}`,
                        typeArguments: payload.typeArguments,
                        functionArguments: payload.arguments,
                    },
                    options: {
                        gasUnitPrice: payload.gasUnitPrice
                            ? parseInt(payload.gasUnitPrice)
                            : undefined,
                        maxGasAmount: payload.maxGasAmount
                            ? parseInt(payload.maxGasAmount)
                            : undefined,
                    },
                });

                // Simulate the transaction using account's public key
                const [simulationResponse] = await aptos.transaction.simulate.simple({
                    signerPublicKey: account.publicKey,
                    transaction,
                });

                // Parse the response
                const result = parseSimulationResponse(simulationResponse);
                setState({ isLoading: false, error: null, result });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Simulation failed";
                setState({ isLoading: false, error: errorMessage, result: null });
            }
        },
        [account]
    );

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, result: null });
    }, []);

    return { ...state, simulate, reset, isWalletConnected: !!account };
}

function parseSimulationResponse(response: unknown): SimulationResult {
    const res = response as {
        success: boolean;
        vm_status: string;
        gas_used: string;
        max_gas_amount: string;
        events: Array<{
            type: string;
            data: Record<string, unknown>;
            sequence_number: string;
        }>;
        changes: unknown[];
    };

    const assetChanges = parseAssetChanges(res.events);
    const trace = buildExecutionTrace(res.events, res.changes);

    return {
        success: res.success,
        vmStatus: res.vm_status,
        gasUsed: parseInt(res.gas_used),
        gasLimit: parseInt(res.max_gas_amount),
        assetChanges,
        events: res.events.map((e) => ({
            type: e.type,
            data: e.data,
            sequenceNumber: e.sequence_number,
        })),
        trace,
        changes: res.changes,
        rawResponse: response,
    };
}

function parseAssetChanges(
    events: Array<{
        type: string;
        data: Record<string, unknown>;
    }>
): AssetChange[] {
    const changes: AssetChange[] = [];

    for (const event of events) {
        if (event.type.includes("::coin::WithdrawEvent")) {
            const coinType = event.type.match(/<([^>]+)>/)?.[1] || "Unknown";
            changes.push({
                address: (event.data.account as string) || "sender",
                asset: coinType.split("::").pop() || coinType,
                amount: event.data.amount as string,
                direction: "out",
            });
        }
        if (event.type.includes("::coin::DepositEvent")) {
            const coinType = event.type.match(/<([^>]+)>/)?.[1] || "Unknown";
            changes.push({
                address: (event.data.account as string) || "receiver",
                asset: coinType.split("::").pop() || coinType,
                amount: event.data.amount as string,
                direction: "in",
            });
        }
    }

    return changes;
}

function buildExecutionTrace(
    events: Array<{ type: string }>,
    changes: unknown[]
): TraceNode {
    const root: TraceNode = {
        name: "Transaction Execution",
        type: "function",
        children: [],
    };

    for (const event of events) {
        root.children.push({
            name: `Event: ${event.type.split("::").slice(-1)[0]}`,
            type: "event",
            children: [],
        });
    }

    if (changes.length > 0) {
        const changesNode: TraceNode = {
            name: "State Changes",
            type: "write",
            children: changes.map((_, i) => ({
                name: `Change #${i + 1}`,
                type: "write" as const,
                children: [],
            })),
        };
        root.children.push(changesNode);
    }

    return root;
}
