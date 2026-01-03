/**
 * Type definitions for the Aptos Fork Simulator backend
 */

/**
 * Supported networks (Movement chain only)
 */
export type Network =
    | 'movement-mainnet'
    | 'movement-testnet'
    | 'custom';

/**
 * Network configuration
 */
export const NETWORK_URLS: Record<Exclude<Network, 'custom'>, string> = {
    'movement-mainnet': 'https://rpc.sentio.xyz/RFVbBBAIS1N4PJQztVQFCbRihhdDXCfV/movement/v1',
    'movement-testnet': 'https://aptos.testnet.porto.movementnetwork.xyz/v1',
};

/**
 * Session configuration stored in config.json
 */
export interface SessionConfig {
    id: string;
    name?: string;
    network: Network;
    nodeUrl: string;
    networkVersion?: number;
    apiKey?: string;
    createdAt: string;
    ops: number;
}

/**
 * Request to initialize a new session
 */
export interface InitSessionRequest {
    network: Network;
    customUrl?: string;
    networkVersion?: number;
    apiKey?: string;
}

/**
 * Request to fund an account
 */
export interface FundAccountRequest {
    account: string;
    amount: number; // in Octa (1 APT = 100_000_000 Octa)
}

/**
 * Request to execute a transaction
 */
export interface ExecuteTransactionRequest {
    functionId: string;
    typeArguments?: string[];
    args?: string[];
    sender?: string;
}

/**
 * Request to execute a view function
 */
export interface ViewFunctionRequest {
    functionId: string;
    typeArguments?: string[];
    args?: string[];
}

/**
 * Request to view a resource
 */
export interface ViewResourceRequest {
    account: string;
    resourceType: string;
}

/**
 * CLI execution result
 */
export interface CLIResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
}

/**
 * Session list response
 */
export interface SessionListResponse {
    sessions: SessionConfig[];
}

/**
 * Session detail response
 */
export interface SessionDetailResponse {
    config: SessionConfig;
    delta: Record<string, unknown>;
    operations: string[];
}

/**
 * Fund account response
 */
export interface FundAccountResponse {
    success: boolean;
    account: string;
    amount: number;
    before: number;
    after: number;
}

/**
 * Execute transaction response
 */
export interface ExecuteTransactionResponse {
    success: boolean;
    status: string;
    gasUsed: number;
    writeSet?: unknown[];
    events?: unknown[];
}

/**
 * View function response
 */
export interface ViewFunctionResponse {
    success: boolean;
    result?: unknown[];
    error?: string;
    gasUsed?: number;
}

/**
 * View resource response
 */
export interface ViewResourceResponse {
    success: boolean;
    resource?: unknown;
    error?: string;
}
