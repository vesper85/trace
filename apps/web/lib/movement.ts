import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey, InputEntryFunctionData } from "@aptos-labs/ts-sdk";
import { NetworkType, NETWORKS } from "../app/simulator/types";

// Create Aptos client for a given network
export function getMovementClient(network: NetworkType): Aptos {
    const networkConfig = NETWORKS[network];
    const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: networkConfig.fullnode,
    });
    return new Aptos(config);
}

// Types for simulation
export interface SimulationInput {
    contractAddress: string;
    moduleName: string;
    functionName: string;
    typeArguments: string[];
    functionArguments: string[];
    senderAddress: string;
    gasLimit: string;
    gasPrice: string;
}

export interface SimulationResult {
    success: boolean;
    vmStatus: string;
    gasUsed: number;
    gasUnitPrice: number;
    maxGasAmount: number;
    events: SimulationEvent[];
    changes: StateChange[];
    rawResponse: unknown;
}

export interface SimulationEvent {
    guid: {
        creation_number: string;
        account_address: string;
    };
    sequence_number: string;
    type: string;
    data: unknown;
}

export interface StateChange {
    type: string;
    address?: string;
    stateKeyHash?: string;
    data?: unknown;
}

// Simulate a transaction
export async function simulateTransaction(
    network: NetworkType,
    input: SimulationInput
): Promise<SimulationResult> {
    const client = getMovementClient(network);

    // Create a temporary account for simulation
    // For simulation, we need a valid account structure but the private key doesn't matter
    const tempAccount = Account.generate();

    // Build the transaction payload
    const functionId = `${input.contractAddress}::${input.moduleName}::${input.functionName}`;

    // Parse function arguments based on their expected types
    const parsedArgs = input.functionArguments.map((arg, index) => {
        // Try to parse as number if it looks like one
        if (/^\d+$/.test(arg)) {
            return BigInt(arg);
        }
        // Return as string (addresses, etc.)
        return arg;
    });

    try {
        // Build the transaction
        const transaction = await client.transaction.build.simple({
            sender: input.senderAddress || tempAccount.accountAddress.toString(),
            data: {
                function: functionId as `${string}::${string}::${string}`,
                typeArguments: input.typeArguments,
                functionArguments: parsedArgs,
            },
        });

        // Simulate the transaction
        // For simulation without a real account, we use simulateTransaction with a public key
        const simulationResults = await client.transaction.simulate.simple({
            signerPublicKey: tempAccount.publicKey,
            transaction,
        });

        const simulationResponse = simulationResults[0];

        if (!simulationResponse) {
            throw new Error("No simulation response received");
        }

        return {
            success: simulationResponse.success,
            vmStatus: simulationResponse.vm_status,
            gasUsed: parseInt(simulationResponse.gas_used),
            gasUnitPrice: parseInt(simulationResponse.gas_unit_price),
            maxGasAmount: parseInt(simulationResponse.max_gas_amount),
            events: simulationResponse.events.map((e: any) => ({
                guid: e.guid,
                sequence_number: e.sequence_number,
                type: e.type,
                data: e.data,
            })),
            changes: simulationResponse.changes.map((c: any) => ({
                type: c.type,
                address: c.address,
                stateKeyHash: c.state_key_hash,
                data: c.data,
            })),
            rawResponse: simulationResponse,
        };
    } catch (error) {
        console.error("Simulation error:", error);
        throw error;
    }
}

// Types for view function calls
export interface ViewInput {
    contractAddress: string;
    moduleName: string;
    functionName: string;
    typeArguments: string[];
    functionArguments: string[];
}

export interface ViewResult {
    success: boolean;
    result: unknown[];
    rawResponse: unknown;
}

// Call a view function (read-only, no gas needed)
export async function callViewFunction(
    network: NetworkType,
    input: ViewInput
): Promise<ViewResult> {
    const client = getMovementClient(network);

    const functionId = `${input.contractAddress}::${input.moduleName}::${input.functionName}`;

    // Parse function arguments
    const parsedArgs = input.functionArguments.map((arg) => {
        // Try to parse as number if it looks like one
        if (/^\d+$/.test(arg)) {
            return BigInt(arg);
        }
        // Return as string (addresses, etc.)
        return arg;
    });

    try {
        const result = await client.view({
            payload: {
                function: functionId as `${string}::${string}::${string}`,
                typeArguments: input.typeArguments,
                functionArguments: parsedArgs,
            },
        });

        return {
            success: true,
            result: result,
            rawResponse: result,
        };
    } catch (error) {
        console.error("View function error:", error);
        throw error;
    }
}

// Default export for convenience
const config = new AptosConfig({
    network: Network.CUSTOM,
    fullnode: 'https://full.mainnet.movementinfra.xyz/v1',
});

export const movement = new Aptos(config);
