/**
 * Session management routes
 */

import { Elysia, t } from 'elysia';
import {
    initSession,
    readSessionDelta,
    listSessionOperations,
    readOperationContents,
    deleteSession,
    getSessionDefaultAccount,
    getAccountBalance,
} from '../lib/cli';
import {
    createSession as createSessionInDb,
    getSessionById,
    listAllSessions,
    deleteSessionFromDb,
    getSessionTransactions,
} from '../lib/db';
import { NETWORK_URLS, type Network, type SessionConfig } from '../lib/types';

// Extended request type with name field
interface InitSessionRequest {
    name?: string;
    network: Network;
    customUrl?: string;
    networkVersion?: number;
    apiKey?: string;
}

// Generate a unique session ID
function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess-${timestamp}-${random}`;
}

export const sessionsRoutes = new Elysia({ prefix: '/sessions' })
    // List all sessions - from database
    .get('/', async () => {
        const dbSessions = await listAllSessions();

        // Map database records to SessionConfig format
        // Convert null to undefined and Date to string for type compatibility
        const sessions: SessionConfig[] = dbSessions.map(s => ({
            id: s.id,
            name: s.name,
            network: s.network,
            nodeUrl: s.nodeUrl,
            networkVersion: s.networkVersion ?? undefined,
            apiKey: s.apiKey ?? undefined,
            createdAt: s.createdAt.toISOString(),
            ops: s.ops,
        }));

        return { sessions };
    })

    // Get session details
    .get('/:sessionId', async ({ params, set }) => {
        const { sessionId } = params;

        // Get from database first
        const dbSession = await getSessionById(sessionId);

        if (!dbSession) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        // Get delta and operations from disk (CLI-managed)
        const delta = await readSessionDelta(sessionId);
        const operationNames = await listSessionOperations(sessionId);

        // Read full operation contents for each operation
        const operations = await Promise.all(
            operationNames.map(opName => readOperationContents(sessionId, opName))
        );

        // Get transactions from database
        const transactions = await getSessionTransactions(sessionId);

        // Get default account and balance
        const defaultAccount = await getSessionDefaultAccount(sessionId);
        let accountBalance = 0;
        if (defaultAccount) {
            accountBalance = await getAccountBalance(sessionId, defaultAccount);
        }

        return {
            config: {
                id: dbSession.id,
                name: dbSession.name,
                network: dbSession.network,
                nodeUrl: dbSession.nodeUrl,
                networkVersion: dbSession.networkVersion,
                createdAt: dbSession.createdAt,
                ops: dbSession.ops,
            },
            delta,
            operations,
            transactions: transactions.map(tx => ({
                id: tx.id,
                functionId: tx.functionId,
                sender: tx.sender,
                success: tx.success,
                status: tx.status,
                gasUsed: tx.gasUsed,
                timestamp: tx.createdAt,
                typeArguments: tx.typeArguments,
                args: tx.args,
            })),
            defaultAccount: defaultAccount ? {
                address: defaultAccount,
                balance: accountBalance,
            } : null,
        };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
    })

    // Initialize a new session
    .post('/init', async ({ body, set }) => {
        const { name, network, customUrl, networkVersion, apiKey } = body as InitSessionRequest;

        // Determine the node URL
        let nodeUrl: string;
        if (network === 'custom' && customUrl) {
            nodeUrl = customUrl;
        } else if (network !== 'custom') {
            nodeUrl = NETWORK_URLS[network];
        } else {
            set.status = 400;
            return { error: 'Custom URL required for custom network' };
        }

        // Generate session ID
        const sessionId = generateSessionId();
        const sessionName = name || `Session ${sessionId.slice(5, 13)}`;

        // Initialize the session using CLI (creates disk-based session)
        const result = await initSession(sessionId, network, nodeUrl, networkVersion, apiKey);

        if (!result.success) {
            set.status = 500;
            return {
                error: 'Failed to initialize session',
                details: result.stderr || result.stdout,
            };
        }

        // Save session to database
        const dbSession = await createSessionInDb({
            id: sessionId,
            name: sessionName,
            network,
            nodeUrl: nodeUrl,
            networkVersion: networkVersion,
            apiKey: apiKey,
            ops: 0,
        });

        if (!dbSession) {
            // CLI session was created but DB failed - continue anyway
            console.error('Warning: Failed to save session to database');
        }

        // Get the default account from the session's profile
        const defaultAccount = await getSessionDefaultAccount(sessionId);

        return {
            success: true,
            sessionId,
            defaultAccount,
            config: {
                id: sessionId,
                name: sessionName,
                network,
                nodeUrl,
                networkVersion,
                createdAt: dbSession?.createdAt || new Date().toISOString(),
                ops: 0,
            },
            message: result.stdout,
        };
    }, {
        body: t.Object({
            name: t.Optional(t.String()),
            network: t.Union([
                t.Literal('movement-mainnet'),
                t.Literal('movement-testnet'),
                t.Literal('custom'),
            ]),
            customUrl: t.Optional(t.String()),
            networkVersion: t.Optional(t.Number()),
            apiKey: t.Optional(t.String()),
        }),
    })

    // Delete a session
    .delete('/:sessionId', async ({ params, set }) => {
        const { sessionId } = params;

        // Check if session exists in database
        const dbSession = await getSessionById(sessionId);
        if (!dbSession) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        // Delete from disk (CLI session files)
        const deletedFromDisk = await deleteSession(sessionId);
        if (!deletedFromDisk) {
            console.error('Warning: Failed to delete session from disk');
        }

        // Delete from database
        const deletedFromDb = await deleteSessionFromDb(sessionId);
        if (!deletedFromDb) {
            set.status = 500;
            return { error: 'Failed to delete session from database' };
        }

        return { success: true };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
    });
