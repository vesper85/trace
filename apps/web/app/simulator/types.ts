export type NetworkType = "mainnet" | "testnet" | "devnet";

export interface NetworkConfig {
    name: string;
    fullnode: string;
    faucet?: string;
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
    mainnet: {
        name: "Mainnet",
        fullnode: "https://full.mainnet.movementinfra.xyz/v1",
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

// Move function types
export interface MoveFunctionParam {
    constraints: string[];
}

export interface MoveExposedFunction {
    name: string;
    visibility: "public" | "friend" | "private";
    is_entry: boolean;
    is_view: boolean;
    generic_type_params: MoveFunctionParam[];
    params: string[];
    return: string[];
}

export interface ModuleInfo {
    name: string;
    address: string;
    functions: MoveExposedFunction[];
}

export interface ContractInfo {
    address: string;
    modules: ModuleInfo[];
}

export interface FunctionInputValue {
    name: string;
    type: string;
    value: string;
}

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
    gasUnitPrice: number;
    maxGasAmount: number;
    events: SimulationEvent[];
    changes: unknown[];
    rawResponse: unknown;
}

export interface SimulationState {
    isLoading: boolean;
    error: string | null;
    result: SimulationResult | null;
}

// Transaction parameters
export interface TransactionParameters {
    senderAddress: string;
    gasLimit: string;
    gasPrice: string;
    value: string;
}

