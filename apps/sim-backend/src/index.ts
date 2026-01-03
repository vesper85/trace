/**
 * Aptos Fork Simulator Backend
 * 
 * A Node.js/Elysia server that wraps the aptos move sim CLI
 * to provide a REST API for fork-based transaction simulation.
 */

import 'dotenv/config';

import { Elysia } from 'elysia';
import { node } from '@elysiajs/node';
import { cors } from '@elysiajs/cors';
import { sessionsRoutes } from './routes/sessions';
import { simulateRoutes } from './routes/simulate';
import { viewRoutes } from './routes/view';
import { SESSIONS_DIR, APTOS_CLI, ensureSessionsDir } from './lib/cli';

const PORT = parseInt(process.env.PORT || '3001');

// Ensure sessions directory exists on startup
await ensureSessionsDir();

const app = new Elysia({ adapter: node() })
    // Enable CORS for frontend access
    .use(cors({
        origin: /localhost:\d+$/,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    }))

    // Health check
    .get('/health', () => ({
        status: 'ok',
        sessionsDir: SESSIONS_DIR,
        aptosCli: APTOS_CLI,
    }))

    // Mount routes
    .use(sessionsRoutes)
    .use(simulateRoutes)
    .use(viewRoutes)

    // Error handling
    .onError(({ error, set }) => {
        console.error('Server error:', error);
        set.status = 500;
        return {
            error: 'Internal server error',
            message: 'message' in error ? String(error.message) : 'Unknown error',
        };
    })

    .listen(PORT);

console.log(`🚀 Aptos Fork Simulator Backend running at http://localhost:${PORT}`);
console.log(`📁 Sessions directory: ${SESSIONS_DIR}`);
console.log(`🔧 Aptos CLI: ${APTOS_CLI}`);

export type App = typeof app;
