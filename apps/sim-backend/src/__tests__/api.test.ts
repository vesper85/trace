/**
 * Tests for API endpoints (integration tests)
 * 
 * These tests start the Elysia server and test the HTTP endpoints.
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { sessionsRoutes } from "../routes/sessions";
import { simulateRoutes } from "../routes/simulate";
import { viewRoutes } from "../routes/view";

// Create a test app instance
function createTestApp() {
    return new Elysia()
        .use(cors())
        .get("/health", () => ({ status: "ok" }))
        .use(sessionsRoutes)
        .use(simulateRoutes)
        .use(viewRoutes);
}

describe("Health Endpoint", () => {
    const app = createTestApp();

    test("GET /health returns ok status", async () => {
        const response = await app.handle(
            new Request("http://localhost/health")
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.status).toBe("ok");
    });
});

describe("Sessions API", () => {
    const app = createTestApp();

    test("GET /sessions returns sessions array", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions")
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("sessions");
        expect(Array.isArray(body.sessions)).toBe(true);
    });

    test("GET /sessions/:sessionId returns 404 for non-existent session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/non-existent-123")
        );

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Session not found");
    });

    test("POST /sessions/init with valid body schema", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    network: "movement-testnet",
                }),
            })
        );

        // Will fail if aptos CLI is not installed, but should not be 400
        expect(response.status).not.toBe(400);
    });

    test("POST /sessions/init rejects invalid network", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    network: "invalid-network",
                }),
            })
        );

        // Should be a validation error (422) or bad request (400)
        expect([400, 422]).toContain(response.status);
    });

    test("DELETE /sessions/:sessionId returns 404 for non-existent session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/non-existent-456", {
                method: "DELETE",
            })
        );

        expect(response.status).toBe(404);
    });
});

describe("Simulate API", () => {
    const app = createTestApp();

    test("POST /sessions/:id/fund returns 404 for non-existent session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/non-existent-123/fund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account: "0x1",
                    amount: 100000000,
                }),
            })
        );

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Session not found");
    });

    test("POST /sessions/:id/fund validates required fields", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/some-session/fund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // Missing account and amount
                }),
            })
        );

        // Should be validation error
        expect([400, 422]).toContain(response.status);
    });

    test("POST /sessions/:id/execute returns 404 for non-existent session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/non-existent-123/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    functionId: "0x1::aptos_account::transfer",
                    args: ["0x2", "1000"],
                }),
            })
        );

        expect(response.status).toBe(404);
    });

    test("POST /sessions/:id/execute validates required functionId", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/some-session/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // Missing functionId
                }),
            })
        );

        expect([400, 422]).toContain(response.status);
    });
});

describe("View API", () => {
    const app = createTestApp();

    test("POST /sessions/:id/view returns 404 for non-existent session", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/non-existent-123/view", {
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

    test("GET /sessions/:id/resource requires query params", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/some-session/resource")
        );

        // Missing query params should be validation error
        expect([400, 422]).toContain(response.status);
    });

    test("GET /sessions/:id/resource returns 404 for non-existent session", async () => {
        const response = await app.handle(
            new Request(
                "http://localhost/sessions/non-existent-123/resource?account=0x1&resourceType=0x1::account::Account"
            )
        );

        expect(response.status).toBe(404);
    });
});

describe("Request Validation", () => {
    const app = createTestApp();

    test("Invalid JSON body returns error", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "not valid json",
            })
        );

        expect([400, 422]).toContain(response.status);
    });

    test("Missing Content-Type header still works with valid JSON", async () => {
        const response = await app.handle(
            new Request("http://localhost/sessions/init", {
                method: "POST",
                body: JSON.stringify({ network: "movement-testnet" }),
            })
        );

        // Should process the request (might fail due to CLI, but not bad request)
        expect(response.status).not.toBe(400);
    });
});
