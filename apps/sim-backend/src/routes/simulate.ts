/**
 * Simulation routes - execute transactions and fund accounts
 */

import { Elysia, t } from 'elysia';
import {
    fundAccount,
    executeTransaction,
    readSessionConfig,
    getSessionDefaultAccount,
} from '../lib/cli';
import type { FundAccountRequest, ExecuteTransactionRequest } from '../lib/types';

export const simulateRoutes = new Elysia({ prefix: '/sessions/:sessionId' })
    // Fund an account
    .post('/fund', async ({ params, body, set }) => {
        const { sessionId } = params;
        const { account, amount } = body as FundAccountRequest;

        // Check session exists
        const config = await readSessionConfig(sessionId);
        if (!config) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        // Fund the account
        const result = await fundAccount(sessionId, account, amount);

        if (!result.success) {
            set.status = 500;
            return {
                error: 'Failed to fund account',
                details: result.stderr || result.stdout,
            };
        }

        // Parse the output to extract before/after amounts
        // The CLI outputs JSON with the funding result
        try {
            // Try to parse JSON from stdout
            const match = result.stdout.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return {
                    success: true,
                    account,
                    amount,
                    before: parsed.before || 0,
                    after: parsed.after || amount,
                };
            }
        } catch {
            // Fallback if parsing fails
        }

        return {
            success: true,
            account,
            amount,
            before: 0,
            after: amount,
            message: result.stdout,
        };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
        body: t.Object({
            account: t.String(),
            amount: t.Number(),
        }),
    })

    // Execute a transaction
    .post('/execute', async ({ params, body, set }) => {
        const { sessionId } = params;
        const { functionId, typeArguments, args, sender } = body as ExecuteTransactionRequest;

        // Check session exists
        const config = await readSessionConfig(sessionId);
        if (!config) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        // Use provided sender or fall back to session's default account
        let senderAccount = sender;
        if (!senderAccount) {
            senderAccount = await getSessionDefaultAccount(sessionId) ?? undefined;
        }

        // Execute the transaction
        const result = await executeTransaction(
            sessionId,
            functionId,
            typeArguments,
            args,
            senderAccount
        );

        if (!result.success) {
            set.status = 500;
            return {
                error: 'Failed to execute transaction',
                details: result.stderr || result.stdout,
            };
        }

        // Try to parse the output
        try {
            const match = result.stdout.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return {
                    success: true,
                    status: parsed.status || 'Executed',
                    gasUsed: parsed.gas_used || 0,
                    writeSet: parsed.write_set,
                    events: parsed.events,
                };
            }
        } catch {
            // Fallback
        }

        return {
            success: true,
            status: 'Executed',
            gasUsed: 0,
            rawOutput: result.stdout,
        };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
        body: t.Object({
            functionId: t.String(),
            typeArguments: t.Optional(t.Array(t.String())),
            args: t.Optional(t.Array(t.String())),
            sender: t.Optional(t.String()),
        }),
    });
