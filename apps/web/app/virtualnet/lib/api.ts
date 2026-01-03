/**
 * API client for the Aptos Fork Simulator backend
 */

const API_BASE = process.env.NEXT_PUBLIC_SIM_API_URL || 'http://localhost:3001';

export interface SessionConfig {
    id: string;
    name?: string;
    network: 'movement-mainnet' | 'movement-testnet' | 'custom';
    nodeUrl: string;
    networkVersion?: number;
    apiKey?: string;
    createdAt: string;
    ops: number;
}

/**
 * Fee statement from transaction execution
 */
export interface FeeStatement {
    total_charge_gas_units: number;
    execution_gas_units: number;
    io_gas_units: number;
    storage_fee_octas: number;
    storage_fee_refund_octas: number;
}

/**
 * MoveAbort error info
 */
export interface MoveAbortInfo {
    code: number;
    info?: {
        reason_name?: string;
        description?: string;
    };
}

/**
 * Operation summary from summary.json
 */
export interface OperationSummary {
    execute_transaction?: {
        status: { Keep: string | { MoveAbort: MoveAbortInfo } } | { Abort: string };
        gas_used: number;
        fee_statement: FeeStatement;
    };
    fund_fungible?: {
        account: string;
        amount: number;
        before: number;
        after: number;
    };
}

/**
 * Operation event (V1 or V2 format)
 */
export interface OperationEvent {
    V1?: {
        key: { creation_number: number; account_address: string };
        sequence_number: number;
        type_tag: string;
        event_data: Record<string, unknown>;
    };
    V2?: {
        type_tag: string;
        event_data: Record<string, unknown>;
    };
}

/**
 * Resource write/delete operation
 */
export interface ResourceChange {
    write?: { data: Record<string, unknown> };
    delete?: boolean;
}

/**
 * Full operation contents from the 3 operation files
 */
export interface OperationContents {
    name: string;
    index: number;
    operationType: 'execute' | 'fund' | 'unknown';
    summary: OperationSummary | null;
    events: OperationEvent[];
    writeSet: Record<string, ResourceChange>;
}

/**
 * Account information
 */
export interface AccountInfo {
    address: string;
    balance: number;
}

export interface SessionDetail {
    config: SessionConfig;
    delta: Record<string, unknown>;
    operations: OperationContents[];
    defaultAccount: AccountInfo | null;
}

export interface InitSessionParams {
    name?: string;
    network: 'movement-mainnet' | 'movement-testnet' | 'custom';
    customUrl?: string;
    networkVersion?: number;
    apiKey?: string;
}

export interface InitSessionResponse {
    success: boolean;
    sessionId: string;
    config: SessionConfig | null;
    message?: string;
    error?: string;
}

export interface FundAccountParams {
    account: string;
    amount: number;
}

export interface FundAccountResponse {
    success: boolean;
    account: string;
    amount: number;
    before: number;
    after: number;
    error?: string;
}

export interface ExecuteTransactionParams {
    functionId: string;
    typeArguments?: string[];
    args?: string[];
    sender?: string;
}

export interface ExecuteTransactionResponse {
    success: boolean;
    status: string;
    gasUsed: number;
    writeSet?: unknown[];
    events?: unknown[];
    error?: string;
    vmStatus?: string;
    rawOutput?: string;
}

export interface ViewFunctionParams {
    functionId: string;
    typeArguments?: string[];
    args?: string[];
}

export interface ViewFunctionResponse {
    success: boolean;
    result?: unknown[];
    gasUsed?: number;
    error?: string;
}

export interface ViewResourceParams {
    account: string;
    resourceType: string;
}

export interface ViewResourceResponse {
    success: boolean;
    resource?: unknown;
    error?: string;
}

// Helper for API requests
async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data as T;
}

// Session Management

export async function listSessions(): Promise<{ sessions: SessionConfig[] }> {
    return apiRequest('/sessions');
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
    return apiRequest(`/sessions/${sessionId}`);
}

export async function initSession(params: InitSessionParams): Promise<InitSessionResponse> {
    return apiRequest('/sessions/init', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function deleteSession(sessionId: string): Promise<{ success: boolean }> {
    return apiRequest(`/sessions/${sessionId}`, {
        method: 'DELETE',
    });
}

// Simulation Operations

export async function fundAccount(
    sessionId: string,
    params: FundAccountParams
): Promise<FundAccountResponse> {
    return apiRequest(`/sessions/${sessionId}/fund`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function executeTransaction(
    sessionId: string,
    params: ExecuteTransactionParams
): Promise<ExecuteTransactionResponse> {
    return apiRequest(`/sessions/${sessionId}/execute`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

// View Operations

export async function viewFunction(
    sessionId: string,
    params: ViewFunctionParams
): Promise<ViewFunctionResponse> {
    return apiRequest(`/sessions/${sessionId}/view`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function viewResource(
    sessionId: string,
    params: ViewResourceParams
): Promise<ViewResourceResponse> {
    const queryParams = new URLSearchParams({
        account: params.account,
        resourceType: params.resourceType,
    });
    return apiRequest(`/sessions/${sessionId}/resource?${queryParams}`);
}

// Health check
export async function checkHealth(): Promise<{
    status: string;
    sessionsDir: string;
    aptosCli: string;
}> {
    return apiRequest('/health');
}
