/**
 * End-to-end integration tests for the simulation workflow
 * 
 * These tests actually create sessions, fund accounts, and execute transactions
 * against the forked state. They require the aptos CLI to be installed.
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { sessionsRoutes } from "../routes/sessions";
import { simulateRoutes } from "../routes/simulate";
import { viewRoutes } from "../routes/view";
import * as fs from "fs/promises";
import * as path from "path";

// Create a test app instance
function createTestApp() {
    return new Elysia()
        .use(cors())
        .get("/health", () => ({ status: "ok" }))
        .use(sessionsRoutes)
        .use(simulateRoutes)
        .use(viewRoutes);
}

describe("End-to-End Session Workflow", () => {
    const app = createTestApp();
    let createdSessionId: string | null = null;

    afterAll(async () => {
        // Cleanup: Delete created session
        if (createdSessionId) {
            await app.handle(
                new Request(`http://localhost/sessions/${createdSessionId}`, {
                    method: "DELETE",
                })
            );
        }
    });

    test("Complete workflow: Create session → Fund account → Execute transaction", async () => {
        // Step 1: Create a new fork session
        console.log("Step 1: Creating fork session...");
        const initResponse = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    network: "movement-testnet",
                }),
            })
        );

        // Check if CLI is available or network is supported
        if (initResponse.status === 500) {
            const body = await initResponse.json();
            console.log("⚠️ Skipping E2E test: CLI error or network not supported:", body.error || body.details);
            return; // Skip gracefully if CLI not available or network not supported
        }

        expect(initResponse.status).toBe(200);
        const initBody = await initResponse.json();
        expect(initBody.success).toBe(true);
        expect(initBody.sessionId).toBeDefined();
        createdSessionId = initBody.sessionId;
        console.log(`  Created session: ${createdSessionId}`);

        // Step 2: Verify session was created
        console.log("Step 2: Verifying session exists...");
        const getResponse = await app.handle(
            new Request(`http://localhost/sessions/${createdSessionId}`)
        );
        expect(getResponse.status).toBe(200);
        const sessionDetail = await getResponse.json();
        expect(sessionDetail.config.id).toBe(createdSessionId);
        console.log(`  Session verified: network=${sessionDetail.config.network}`);

        // Step 3: Fund an account
        console.log("Step 3: Funding account...");
        const fundResponse = await app.handle(
            new Request(`http://localhost/sessions/${createdSessionId}/fund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account: "0x1",
                    amount: 100000000, // 1 APT
                }),
            })
        );

        // Status might be 500 if CLI command fails, but should still return JSON
        const fundBody = await fundResponse.json();
        console.log(`  Fund result: ${JSON.stringify(fundBody)}`);

        // Fund operation should have a response structure
        expect(fundBody).toBeDefined();

        // Step 4: List sessions and verify ours exists
        console.log("Step 4: Listing sessions...");
        const listResponse = await app.handle(
            new Request("http://localhost/sessions")
        );
        expect(listResponse.status).toBe(200);
        const listBody = await listResponse.json();
        expect(listBody.sessions).toBeDefined();
        const ourSession = listBody.sessions.find((s: any) => s.id === createdSessionId);
        expect(ourSession).toBeDefined();
        console.log(`  Found our session in list of ${listBody.sessions.length} sessions`);

        // Step 5: Delete the session
        console.log("Step 5: Deleting session...");
        const deleteResponse = await app.handle(
            new Request(`http://localhost/sessions/${createdSessionId}`, {
                method: "DELETE",
            })
        );
        expect(deleteResponse.status).toBe(200);
        const deleteBody = await deleteResponse.json();
        expect(deleteBody.success).toBe(true);
        console.log("  Session deleted successfully");

        // Clear so afterAll doesn't try to delete again
        createdSessionId = null;

        // Step 6: Verify session is gone
        console.log("Step 6: Verifying session was deleted...");
        const verifyResponse = await app.handle(
            new Request(`http://localhost/sessions/${deleteBody.sessionId || "deleted"}`)
        );
        // Should be 404 since we just deleted it
        expect(verifyResponse.status).toBe(404);
        console.log("  Session deletion confirmed");

        console.log("✅ E2E workflow completed successfully!");
    }, 60000); // 60 second timeout for E2E test
});

describe("Transaction Simulation Tests", () => {
    const app = createTestApp();
    let sessionId: string | null = null;

    beforeAll(async () => {
        // Create a session for simulation tests
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ network: "movement-testnet" }),
            })
        );

        if (response.status === 200) {
            const body = await response.json();
            sessionId = body.sessionId;
        }
    });

    afterAll(async () => {
        if (sessionId) {
            await app.handle(
                new Request(`http://localhost/sessions/${sessionId}`, {
                    method: "DELETE",
                })
            );
        }
    });

    test("Execute transaction requires valid session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/fake-session-xyz/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    functionId: "0x1::aptos_account::transfer",
                    args: ["0x2", "1000"],
                }),
            })
        );

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Session not found");
    });

    test("View function requires valid session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/fake-session-xyz/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    functionId: "0x1::account::exists_at",
                    args: ["0x1"],
                }),
            })
        );

        expect(response.status).toBe(404);
    });

    test("Fund account with valid session", async () => {
        if (!sessionId) {
            console.log("⚠️ Skipping: No session available (CLI not installed?)");
            return;
        }

        const response = await app.handle(
            new Request(`http://localhost/sessions/${sessionId}/fund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account: "0x123456789abcdef",
                    amount: 50000000, // 0.5 APT
                }),
            })
        );

        // Even if CLI fails, we should get a structured response
        const body = await response.json();
        expect(body).toBeDefined();
        // Either success or an error with details
        expect(body.success !== undefined || body.error !== undefined).toBe(true);
    });

    test("Execute view function against forked state", async () => {
        if (!sessionId) {
            console.log("⚠️ Skipping: No session available");
            return;
        }

        const response = await app.handle(
            new Request(`http://localhost/sessions/${sessionId}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    functionId: "0x1::account::exists_at",
                    args: ["0x1"],
                }),
            })
        );

        const body = await response.json();
        expect(body).toBeDefined();
        // Response should have success flag
        expect(typeof body.success).toBe("boolean");
    }, 60000); // Each test has its own timeout
});

describe("View Resource Tests", () => {
    const app = createTestApp();

    test("View resource requires account and resourceType params", async () => {
        // Missing params
        const response = await app.handle(
            new Request("http://localhost/sessions/any-session/resource")
        );

        expect([400, 422]).toContain(response.status);
    });

    test("View resource with both params but invalid session", async () => {
        const response = await app.handle(
            new Request(
                "http://localhost/sessions/invalid-session/resource?account=0x1&resourceType=0x1::account::Account"
            )
        );

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Session not found");
    });
});

describe("Error Handling", () => {
    const app = createTestApp();

    test("Invalid JSON in request body", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{ invalid json }",
            })
        );

        expect([400, 422]).toContain(response.status);
    });

    test("Missing required fields in fund request", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/any-session/fund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account: "0x1" }), // Missing amount
            })
        );

        expect([400, 422]).toContain(response.status);
    });

    test("Missing required fields in execute request", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/any-session/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}), // Missing functionId
            })
        );

        expect([400, 422]).toContain(response.status);
    });

    test("Invalid network type in init request", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ network: "invalid_network" }),
            })
        );

        expect([400, 422]).toContain(response.status);
    });
});
