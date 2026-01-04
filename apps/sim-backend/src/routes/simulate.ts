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
import { recordTransaction, getSessionById } from '../lib/db';
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

        // Check session exists in database
        const dbSession = await getSessionById(sessionId);
        if (!dbSession) {
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

        let txSuccess = result.success;
        let txStatus = 'Executed';
        let txGasUsed = 0;
        let txWriteSet: unknown = undefined;
        let txEvents: unknown = undefined;
        let vmStatus: string | undefined = undefined;

        // Parse the CLI output - it may be text or JSON
        const stdout = result.stdout || '';
        const stderr = result.stderr || '';

        // Check for common failure patterns in output
        if (stderr.includes('error') || stderr.includes('Error') ||
            stdout.includes('ABORTED') || stdout.includes('OUT_OF_GAS') ||
            stdout.includes('EXECUTION_FAILURE')) {
            txSuccess = false;
            txStatus = 'Failed';
        }

        if (!result.success) {
            txSuccess = false;
            txStatus = 'Failed';
        } else {
            // Try to parse JSON output
            try {
                const match = stdout.match(/\{[\s\S]*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);

                    // CLI output structure: { "Result": { "gas_used": 90, "vm_status": "...", ... } }
                    const resultData = parsed.Result || parsed.result || parsed;

                    // Extract values from the Result object
                    txGasUsed = parseInt(resultData.gas_used) || parseInt(resultData.gasUsed) || 0;
                    vmStatus = resultData.vm_status || resultData.vmStatus;
                    txWriteSet = resultData.write_set || resultData.changes;
                    txEvents = resultData.events;

                    // Check success from Result
                    if (resultData.success !== undefined) {
                        txSuccess = resultData.success === true;
                    }

                    // Parse VM status for success/failure
                    if (vmStatus) {
                        txStatus = vmStatus;
                        // Check for success patterns
                        if (vmStatus.includes('EXECUTED') || vmStatus.includes('success')) {
                            txSuccess = true;
                            txStatus = 'Executed';
                        } else if (vmStatus.includes('ABORT') || vmStatus.includes('fail')) {
                            txSuccess = false;
                            txStatus = vmStatus;
                        }
                    }
                }
            } catch {
                // Try to extract info from text output
                const gasMatch = stdout.match(/gas[_\s]?used[:\s]+(\d+)/i);
                if (gasMatch && gasMatch[1]) {
                    txGasUsed = parseInt(gasMatch[1]) || 0;
                }

                const statusMatch = stdout.match(/status[:\s]+([^\n]+)/i);
                if (statusMatch && statusMatch[1]) {
                    txStatus = statusMatch[1].trim();
                }
            }
        }

        // Record transaction in database
        await recordTransaction({
            sessionId: sessionId,
            functionId: functionId,
            sender: senderAccount || 'unknown',
            success: txSuccess,
            status: txStatus,
            gasUsed: txGasUsed,
            typeArguments: typeArguments,
            args: args,
            events: txEvents,
            writeSet: txWriteSet,
        });

        if (!result.success) {
            set.status = 500;
            return {
                success: false,
                error: 'Failed to execute transaction',
                details: stderr || stdout,
                stdout: stdout,
                stderr: stderr,
            };
        }

        return {
            success: txSuccess,
            status: txStatus,
            gasUsed: txGasUsed,
            writeSet: txWriteSet,
            events: txEvents,
            vmStatus: vmStatus,
            // Include raw output for debugging/display
            rawOutput: stdout,
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
