#!/usr/bin/env bun
/**
 * Test script to simulate a transaction on Movement mainnet
 * Using the sim-backend API with the patched Aptos CLI
 * 
 * Function: 0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2::pool::lend
 * Args: 1, 50000000, true
 * Type Args: 0x1::aptos_coin::AptosCoin
 */

const BASE_URL = "http://localhost:3001";

async function main() {
    console.log("🚀 Starting simulation test with patched CLI...\n");

    // Step 1: Create a fork session on Movement mainnet
    console.log("1️⃣ Creating fork session on Movement mainnet...");
    const initResponse = await fetch(`${BASE_URL}/sessions/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            network: "movement-mainnet",
        }),
    });

    if (!initResponse.ok) {
        const error = await initResponse.json();
        console.log("   ❌ Failed to create session:", error);
        return;
    }

    const session = await initResponse.json();
    console.log("   ✅ Session created:", session.sessionId);
    console.log("   Default Account:", session.defaultAccount);

    const sessionId = session.sessionId;
    const defaultAccount = session.defaultAccount;

    if (!defaultAccount) {
        console.log("   ❌ No default account found in session");
        return;
    }

    try {
        // Step 2: Fund the session's default account
        console.log("\n2️⃣ Funding session's default account...");
        const fundResponse = await fetch(`${BASE_URL}/sessions/${sessionId}/fund`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                account: defaultAccount,
                amount: 100000000, // 1 APT
            }),
        });

        if (!fundResponse.ok) {
            const error = await fundResponse.json();
            console.log("   ❌ Failed to fund:", error);
        } else {
            const fundResult = await fundResponse.json();
            console.log("   ✅ Fund result:", fundResult);
        }

        // Step 3: Execute the lend transaction using the session's account
        console.log("\n3️⃣ Simulating lend transaction...");
        console.log("   Function: 0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2::pool::lend");
        console.log("   Type Args: [0x1::aptos_coin::AptosCoin]");
        console.log("   Args: [u64:1, u64:50000000, bool:true]");

        const execResponse = await fetch(`${BASE_URL}/sessions/${sessionId}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // No sender specified - will use the session's default profile
                functionId: "0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2::pool::lend",
                typeArguments: ["0x1::aptos_coin::AptosCoin"],
                // Args in type:value format as required by the CLI
                // Using 0.5 APT (50000000 octas) to leave room for gas from our 1 APT funding
                args: ["u64:1", "u64:50000000", "bool:true"],
            }),
        });

        const execResult = await execResponse.json();
        console.log("\n   🎯 Execution Result:");
        console.log(JSON.stringify(execResult, null, 2));

    } finally {
        // Clean up
        // console.log("\n4️⃣ Cleaning up session...");
        // await fetch(`${BASE_URL}/sessions/${sessionId}`, {
        //     method: "DELETE",
        // });
        // console.log("   ✅ Session deleted");
    }

    console.log("\n✨ Done!");
}

main().catch(console.error);
