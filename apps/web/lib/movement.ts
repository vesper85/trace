import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";
import { NetworkType, NETWORKS } from "../app/(app)/simulator/types";

// create aptos client for a given network
export function getMovementClient(network: NetworkType): Aptos {
    const networkConfig = NETWORKS[network];
    const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: networkConfig.fullnode,
    });
    return new Aptos(config);
}

// types for simulation
export interface SimulationInput {
    contractAddress: string;
    moduleName: string;
    functionName: string;
    typeArguments: string[];
    functionArguments: string[];
    senderAddress: string;
    gasLimit: string;
    gasPrice: string;
    // optional: public key hex string from connected wallet
    // when provided, enables simulation with the real sender address
    senderPublicKeyHex?: string;
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

// simulate a transaction
export async function simulateTransaction(
    network: NetworkType,
    input: SimulationInput
): Promise<SimulationResult> {
    const client = getMovementClient(network);

    // build the transaction payload
    const functionId = `${input.contractAddress}::${input.moduleName}::${input.functionName}`;

    // parse function arguments based on their expected types
    const parsedArgs = input.functionArguments.map((arg) => {
        // try to parse as number if it looks like one
        if (/^\d+$/.test(arg)) {
            return BigInt(arg);
        }
        // handle boolean values
        if (arg === "true" || arg === "false") {
            return arg === "true";
        }
        // return as string (addresses, etc.)
        return arg;
    });

    const senderAddress = input.senderAddress;
    const senderPublicKeyHex = input.senderPublicKeyHex;

    try {
        // for simulation, the public key must derive to the sender's authentication key.
        // this is a fundamental requirement of the move vm.

        // case 1: wallet is connected - use real sender address with wallet's public key
        if (senderAddress && senderPublicKeyHex) {
            console.log("Using wallet public key for simulation with real sender address");

            // import ed25519publickey to create public key from hex
            const { Ed25519PublicKey } = await import("@aptos-labs/ts-sdk");

            // create public key from hex string
            const publicKey = new Ed25519PublicKey(senderPublicKeyHex);

            // build the transaction with the real sender address
            const transaction = await client.transaction.build.simple({
                sender: senderAddress,
                data: {
                    function: functionId as `${string}::${string}::${string}`,
                    typeArguments: input.typeArguments,
                    functionArguments: parsedArgs,
                },
                options: {
                    maxGasAmount: Math.min(parseInt(input.gasLimit) || 200000, 2000000),
                    gasUnitPrice: parseInt(input.gasPrice) || 100,
                },
            });

            // simulate with the wallet's public key
            const simulationResults = await client.transaction.simulate.simple({
                signerPublicKey: publicKey,
                transaction,
            });

            return parseSimulationResponse(simulationResults[0]);
        }

        // case 2: no wallet connected - use a generated account
        console.log("No wallet public key provided, using generated account for simulation");

        const simulationAccount = Account.generate();

        // build the transaction with the generated account's address
        const transaction = await client.transaction.build.simple({
            sender: simulationAccount.accountAddress.toString(),
            data: {
                function: functionId as `${string}::${string}::${string}`,
                typeArguments: input.typeArguments,
                functionArguments: parsedArgs,
            },
            options: {
                maxGasAmount: Math.min(parseInt(input.gasLimit) || 200000, 2000000),
                gasUnitPrice: parseInt(input.gasPrice) || 100,
                // use sequence number 0 for generated accounts since they don't exist on chain
                accountSequenceNumber: 0,
            },
        });

        // simulate the transaction using the sdk method
        const simulationResults = await client.transaction.simulate.simple({
            signerPublicKey: simulationAccount.publicKey,
            transaction,
        });

        const result = parseSimulationResponse(simulationResults[0]);

        // add simulation metadata to indicate this was simulated with a temp account
        if (senderAddress && senderAddress !== simulationAccount.accountAddress.toString()) {
            result.rawResponse = {
                ...(result.rawResponse as object),
                _simulationNote: `Simulated with temporary account. Original sender: ${senderAddress}. ` +
                    `For exact simulation of existing accounts, connect your wallet.`,
                _simulatedSender: simulationAccount.accountAddress.toString(),
                _requestedSender: senderAddress,
            };
        }

        return result;
    } catch (error) {
        console.error("Simulation error:", error);
        throw error;
    }
}

// helper function to parse simulation response
function parseSimulationResponse(simulationResponse: any): SimulationResult {
    if (!simulationResponse) {
        throw new Error("No simulation response received");
    }

    return {
        success: simulationResponse.success,
        vmStatus: simulationResponse.vm_status,
        gasUsed: parseInt(simulationResponse.gas_used),
        gasUnitPrice: parseInt(simulationResponse.gas_unit_price),
        maxGasAmount: parseInt(simulationResponse.max_gas_amount),
        events: (simulationResponse.events || []).map((e: any) => ({
            guid: e.guid,
            sequence_number: e.sequence_number,
            type: e.type,
            data: e.data,
        })),
        changes: (simulationResponse.changes || []).map((c: any) => ({
            type: c.type,
            address: c.address,
            stateKeyHash: c.state_key_hash,
            data: c.data,
        })),
        rawResponse: simulationResponse,
    };
}

// types for view function calls
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

// call a view function (read-only, no gas needed)
export async function callViewFunction(
    network: NetworkType,
    input: ViewInput
): Promise<ViewResult> {
    const client = getMovementClient(network);

    const functionId = `${input.contractAddress}::${input.moduleName}::${input.functionName}`;

    // parse function arguments
    const parsedArgs = input.functionArguments.map((arg) => {
        // try to parse as number if it looks like one
        if (/^\d+$/.test(arg)) {
            return BigInt(arg);
        }
        // return as string (addresses, etc.)
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

// default export for convenience
const config = new AptosConfig({
    network: Network.CUSTOM,
    fullnode: 'https://full.mainnet.movementinfra.xyz/v1',
});

export const movement = new Aptos(config);
