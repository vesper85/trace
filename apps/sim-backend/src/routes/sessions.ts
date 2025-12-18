/**
 * Session management routes
 */

import { Elysia, t } from 'elysia';
import {
    listSessionIds,
    initSession,
    readSessionConfig,
    readSessionDelta,
    listSessionOperations,
    deleteSession,
    getSessionPath,
    getSessionDefaultAccount,
} from '../lib/cli';
import { NETWORK_URLS, type Network, type SessionConfig, type InitSessionRequest } from '../lib/types';

// Generate a unique session ID
function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess-${timestamp}-${random}`;
}

export const sessionsRoutes = new Elysia({ prefix: '/sessions' })
    // List all sessions
    .get('/', async () => {
        const sessionIds = await listSessionIds();
        const sessions: SessionConfig[] = [];

        for (const id of sessionIds) {
            const config = await readSessionConfig(id);
            if (config) {
                sessions.push({
                    id,
                    ...(config as Omit<SessionConfig, 'id'>),
                });
            }
        }

        return { sessions };
    })

    // Get session details
    .get('/:sessionId', async ({ params, set }) => {
        const { sessionId } = params;
        const config = await readSessionConfig(sessionId);

        if (!config) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        const delta = await readSessionDelta(sessionId);
        const operations = await listSessionOperations(sessionId);

        return {
            config: { id: sessionId, ...(config as Omit<SessionConfig, 'id'>) },
            delta,
            operations,
        };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
    })

    // Initialize a new session
    .post('/init', async ({ body, set }) => {
        const { network, customUrl, networkVersion, apiKey } = body as InitSessionRequest;

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

        // Initialize the session using CLI
        const result = await initSession(sessionId, network, nodeUrl, networkVersion, apiKey);

        if (!result.success) {
            set.status = 500;
            return {
                error: 'Failed to initialize session',
                details: result.stderr || result.stdout,
            };
        }

        // Read back the config
        const config = await readSessionConfig(sessionId);

        // Get the default account from the session's profile
        const defaultAccount = await getSessionDefaultAccount(sessionId);

        return {
            success: true,
            sessionId,
            defaultAccount,  // The address to use for funding and transactions
            config: config ? { id: sessionId, ...(config as Omit<SessionConfig, 'id'>) } : null,
            message: result.stdout,
        };
    }, {
        body: t.Object({
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

        const config = await readSessionConfig(sessionId);
        if (!config) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        const deleted = await deleteSession(sessionId);
        if (!deleted) {
            set.status = 500;
            return { error: 'Failed to delete session' };
        }

        return { success: true };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
    });
