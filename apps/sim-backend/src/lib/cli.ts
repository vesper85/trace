/**
 * Aptos CLI wrapper utilities
 * 
 * This module provides utilities for executing the aptos CLI commands
 * for the fork simulation session.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { CLIResult, Network, SessionConfig } from './types';

// Default sessions directory
const SESSIONS_DIR = process.env.APTOS_SIM_SESSIONS_DIR || '/tmp/aptos-sim-sessions';

// Aptos CLI path - defaults to patched version that works with Movement network
// Can be overridden with APTOS_CLI_PATH env var
const APTOS_CLI = process.env.APTOS_CLI_PATH || '/Users/parikshitdeshmukh/projects/aptos/aptos-core/target/release/aptos';

/**
 * Ensures the sessions directory exists
 */
export async function ensureSessionsDir(): Promise<void> {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

/**
 * Gets the path for a session
 */
export function getSessionPath(sessionId: string): string {
    return path.join(SESSIONS_DIR, sessionId);
}

/**
 * Lists all session IDs
 */
export async function listSessionIds(): Promise<string[]> {
    try {
        await ensureSessionsDir();
        const entries = await fs.readdir(SESSIONS_DIR, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    } catch (error) {
        console.error('Error listing sessions:', error);
        return [];
    }
}

/**
 * Executes a command and returns the result
 */
async function execCommand(cmd: string, args: string[], options?: { cwd?: string; env?: Record<string, string | undefined> }): Promise<CLIResult> {
    try {
        const proc = Bun.spawn([cmd, ...args], {
            cwd: options?.cwd,
            env: options?.env || process.env,
            stdout: 'pipe',
            stderr: 'pipe',
        });

        const [stdout, stderr] = await Promise.all([
            new Response(proc.stdout).text(),
            new Response(proc.stderr).text(),
        ]);

        const exitCode = await proc.exited;

        return {
            success: exitCode === 0,
            stdout,
            stderr,
            exitCode,
        };
    } catch (error) {
        return {
            success: false,
            stdout: '',
            stderr: error instanceof Error ? error.message : String(error),
            exitCode: 1,
        };
    }
}

/**
 * Executes an aptos CLI command
 */
export async function runAptosCLI(args: string[]): Promise<CLIResult> {
    return execCommand(APTOS_CLI, args);
}

/**
 * Initializes a new fork session
 */
export async function initSession(
    sessionId: string,
    network: Network,
    nodeUrl: string,
    networkVersion?: number,
    apiKey?: string
): Promise<CLIResult> {
    await ensureSessionsDir();
    const sessionPath = getSessionPath(sessionId);
    console.log(`Initializing session ${sessionId} at ${sessionPath}`);

    const args = ['move', 'sim', 'init', '--path', sessionPath];

    // Add network URL
    args.push('--network', nodeUrl);

    // Add version if specified
    if (networkVersion) {
        args.push('--network-version', networkVersion.toString());
    }

    // Add API key if specified
    if (apiKey) {
        args.push('--api-key', apiKey);
    }

    const result = await runAptosCLI(args);

    // After creating the session, initialize an Aptos profile in the session directory
    // This allows us to run transactions with proper signatures
    if (result.success) {
        await initSessionProfile(sessionId, nodeUrl);
    }

    return result;
}

/**
 * Initializes an Aptos profile (config.yaml) in the session directory
 * This creates a default profile with a new keypair that can be used for transactions
 */
export async function initSessionProfile(sessionId: string, nodeUrl: string): Promise<CLIResult> {
    const sessionPath = getSessionPath(sessionId);

    // Create config directories in session (for both Aptos and Movement CLIs)
    const aptosConfigDir = path.join(sessionPath, '.aptos');
    const movementConfigDir = path.join(sessionPath, '.movement');
    await fs.mkdir(aptosConfigDir, { recursive: true });
    await fs.mkdir(movementConfigDir, { recursive: true });

    // Run CLI init in the session directory to create a profile
    const args = [
        'init',
        '--network', 'custom',
        '--rest-url', nodeUrl,
        '--skip-faucet',
        '--assume-yes',
    ];

    // Run with both APTOS_CONFIG and MOVEMENT_CONFIG set
    // Movement CLI uses MOVEMENT_CONFIG, Aptos CLI uses APTOS_CONFIG
    return execCommand(APTOS_CLI, args, {
        cwd: sessionPath,
        env: {
            ...process.env,
            APTOS_CONFIG: path.join(aptosConfigDir, 'config.yaml'),
            MOVEMENT_CONFIG: path.join(movementConfigDir, 'config.yaml'),
        },
    });
}

/**
 * Gets the default account address from the session's Aptos profile
 */
export async function getSessionDefaultAccount(sessionId: string): Promise<string | null> {
    const sessionPath = getSessionPath(sessionId);

    // Check both Movement CLI (.movement) and Aptos CLI (.aptos) config paths
    const configPaths = [
        path.join(sessionPath, '.movement', 'config.yaml'),
        path.join(sessionPath, '.aptos', 'config.yaml'),
    ];

    for (const configPath of configPaths) {
        try {
            const content = await fs.readFile(configPath, 'utf-8');
            // Parse YAML manually to extract account address
            // Format: profiles:\n  default:\n    account: 0x...\n
            const match = content.match(/account:\s*([0-9a-fA-Fx]+)/);
            if (match?.[1]) {
                // Ensure account has 0x prefix
                const account = match[1];
                return account.startsWith('0x') ? account : `0x${account}`;
            }
        } catch {
            // Continue to next config path
        }
    }
    return null;
}

/**
 * Funds an account in a session
 */
export async function fundAccount(
    sessionId: string,
    account: string,
    amount: number
): Promise<CLIResult> {
    const sessionPath = getSessionPath(sessionId);

    const args = [
        'move', 'sim', 'fund',
        '--session', sessionPath,
        '--account', account,
        '--amount', amount.toString(),
    ];

    return runAptosCLI(args);
}

/**
 * Executes a transaction in a session using the session-aware run command
 * This uses `move run --session` which reads/writes to the local fork state
 * 
 * Uses the session's .aptos/config.yaml for the default profile, which has
 * a matching private key for proper signature validation.
 */
export async function executeTransaction(
    sessionId: string,
    functionId: string,
    typeArguments?: string[],
    args?: string[],
    sender?: string
): Promise<CLIResult> {
    const sessionPath = getSessionPath(sessionId);
    const aptosConfigPath = path.join(sessionPath, '.aptos', 'config.yaml');
    const movementConfigPath = path.join(sessionPath, '.movement', 'config.yaml');

    const cliArgs = [
        'move', 'sim', 'run',
        '--session', sessionPath,
        '--function-id', functionId,
    ];

    // Add sender if specified, otherwise uses a random address
    if (sender) {
        cliArgs.push('--sender-account', sender);
    }

    // Add type arguments
    if (typeArguments && typeArguments.length > 0) {
        cliArgs.push('--type-args', ...typeArguments);
    }

    // Add function arguments - these need to be in type:value format
    if (args && args.length > 0) {
        cliArgs.push('--args', ...args);
    }

    // Run with both APTOS_CONFIG and MOVEMENT_CONFIG set to the session's config
    return execCommand(APTOS_CLI, cliArgs, {
        cwd: sessionPath,
        env: {
            ...process.env,
            APTOS_CONFIG: aptosConfigPath,
            MOVEMENT_CONFIG: movementConfigPath,
        },
    });
}

/**
 * Executes a view function in a session
 */
export async function viewFunction(
    sessionId: string,
    functionId: string,
    typeArguments?: string[],
    args?: string[]
): Promise<CLIResult> {
    const sessionPath = getSessionPath(sessionId);

    const cliArgs = [
        'move', 'view',
        '--session', sessionPath,
        '--function-id', functionId,
    ];

    // Add type arguments
    if (typeArguments && typeArguments.length > 0) {
        cliArgs.push('--type-args', ...typeArguments);
    }

    // Add function arguments
    if (args && args.length > 0) {
        cliArgs.push('--args', ...args);
    }

    return runAptosCLI(cliArgs);
}

/**
 * Views a resource in a session
 */
export async function viewResource(
    sessionId: string,
    account: string,
    resourceType: string
): Promise<CLIResult> {
    const sessionPath = getSessionPath(sessionId);

    const cliArgs = [
        'move', 'sim', 'view-resource',
        '--session', sessionPath,
        '--account', account,
        '--resource', resourceType,
    ];

    return runAptosCLI(cliArgs);
}

/**
 * Reads session config from disk
 */
export async function readSessionConfig(sessionId: string): Promise<SessionConfig | null> {
    try {
        const configPath = path.join(getSessionPath(sessionId), 'config.json');
        const content = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/**
 * Reads session delta from disk
 */
export async function readSessionDelta(sessionId: string): Promise<Record<string, unknown>> {
    try {
        const deltaPath = path.join(getSessionPath(sessionId), 'delta.json');
        const content = await fs.readFile(deltaPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return {};
    }
}

/**
 * Lists operation directories in a session
 */
export async function listSessionOperations(sessionId: string): Promise<string[]> {
    try {
        const sessionPath = getSessionPath(sessionId);
        const entries = await fs.readdir(sessionPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory() && entry.name.startsWith('['))
            .map(entry => entry.name)
            .sort();
    } catch {
        return [];
    }
}

/**
 * Deletes a session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
    try {
        const sessionPath = getSessionPath(sessionId);
        await fs.rm(sessionPath, { recursive: true, force: true });
        return true;
    } catch {
        return false;
    }
}

export { SESSIONS_DIR, APTOS_CLI };
