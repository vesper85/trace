/**
 * View routes - read-only operations
 */

import { Elysia, t } from 'elysia';
import {
    viewFunction,
    viewResource,
    readSessionConfig,
} from '../lib/cli';
import type { ViewFunctionRequest, ViewResourceRequest } from '../lib/types';

export const viewRoutes = new Elysia({ prefix: '/sessions/:sessionId' })
    // Execute a view function
    .post('/view', async ({ params, body, set }) => {
        const { sessionId } = params;
        const { functionId, typeArguments, args } = body as ViewFunctionRequest;

        // Check session exists
        const config = await readSessionConfig(sessionId);
        if (!config) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        // Execute the view function
        const result = await viewFunction(sessionId, functionId, typeArguments, args);

        if (!result.success) {
            return {
                success: false,
                error: result.stderr || result.stdout,
            };
        }

        // Try to parse the output
        try {
            const match = result.stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return {
                    success: true,
                    result: Array.isArray(parsed) ? parsed : [parsed],
                    gasUsed: 0, // View functions typically don't report gas in CLI output
                };
            }
        } catch {
            // Fallback
        }

        return {
            success: true,
            result: [result.stdout],
            gasUsed: 0,
        };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
        body: t.Object({
            functionId: t.String(),
            typeArguments: t.Optional(t.Array(t.String())),
            args: t.Optional(t.Array(t.String())),
        }),
    })

    // View a resource
    .get('/resource', async ({ params, query, set }) => {
        const { sessionId } = params;
        const { account, resourceType } = query;

        if (!account || !resourceType) {
            set.status = 400;
            return { error: 'account and resourceType query params required' };
        }

        // Check session exists
        const config = await readSessionConfig(sessionId);
        if (!config) {
            set.status = 404;
            return { error: 'Session not found' };
        }

        // View the resource
        const result = await viewResource(sessionId, account, resourceType);

        if (!result.success) {
            return {
                success: false,
                error: result.stderr || result.stdout,
            };
        }

        // Try to parse the output
        try {
            const match = result.stdout.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                return {
                    success: true,
                    resource: parsed,
                };
            }
        } catch {
            // Fallback
        }

        return {
            success: true,
            resource: result.stdout,
        };
    }, {
        params: t.Object({
            sessionId: t.String(),
        }),
        query: t.Object({
            account: t.String(),
            resourceType: t.String(),
        }),
    });
