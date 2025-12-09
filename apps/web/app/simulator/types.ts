export type NetworkType = "mainnet" | "testnet" | "devnet";

export interface NetworkConfig {
    name: string;
    fullnode: string;
    faucet?: string;
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
    mainnet: {
        name: "Mainnet",
        fullnode: "https://mainnet.movementnetwork.xyz/v1",
    },
    testnet: {
        name: "Testnet",
        fullnode: "https://testnet.movementnetwork.xyz/v1",
        faucet: "https://faucet.testnet.movementnetwork.xyz/",
    },
    devnet: {
        name: "Local Devnet",
        fullnode: "http://localhost:8080/v1",
    },
};

export interface FunctionArgument {
    name: string;
    type: string;
    value: string;
}

export interface TypeArgument {
    name: string;
    value: string;
}

export interface TransactionPayload {
    sender: string;
    function: string;
    typeArguments: string[];
    arguments: string[];
    gasUnitPrice?: string;
    maxGasAmount?: string;
}

export interface StateOverride {
    id: string;
    address: string;
    resourceType: string;
    value: string;
}

export interface SimulationConfig {
    blockNumber?: string;
    timestampOverride?: string;
    stateOverrides: StateOverride[];
}

export interface AssetChange {
    address: string;
    asset: string;
    amount: string;
    direction: "in" | "out";
}

export interface SimulationEvent {
    type: string;
    data: Record<string, unknown>;
    sequenceNumber: string;
}

export interface TraceNode {
    name: string;
    type: "function" | "event" | "write";
    children: TraceNode[];
    gasUsed?: number;
}

export interface SimulationResult {
    success: boolean;
    vmStatus: string;
    gasUsed: number;
    gasLimit: number;
    assetChanges: AssetChange[];
    events: SimulationEvent[];
    trace: TraceNode;
    changes: unknown[];
    rawResponse: unknown;
}

export interface SimulationState {
    isLoading: boolean;
    error: string | null;
    result: SimulationResult | null;
}
