/**
 * Database operations for session persistence using Drizzle ORM
 */

import { eq, desc, sql } from 'drizzle-orm';
import { getDb, sessions, transactions, type Session, type NewSession, type Transaction, type NewTransaction } from '../db';

// Re-export types for backwards compatibility
export type SessionRecord = Session;
export type TransactionRecord = Transaction;

// ============ Session Operations ============

/**
 * Create a new session in the database
 */
export async function createSession(session: Omit<NewSession, 'createdAt' | 'updatedAt'>): Promise<Session | null> {
    const db = getDb();

    try {
        const [result] = await db.insert(sessions).values({
            id: session.id,
            name: session.name,
            network: session.network,
            nodeUrl: session.nodeUrl,
            networkVersion: session.networkVersion,
            apiKey: session.apiKey,
            ops: session.ops || 0,
        }).returning();

        return result || null;
    } catch (error) {
        console.error('Error creating session:', error);
        return null;
    }
}

/**
 * Get a session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
    const db = getDb();

    try {
        const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
        return result[0] || null;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

/**
 * List all sessions
 */
export async function listAllSessions(): Promise<Session[]> {
    const db = getDb();

    try {
        const result = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
        return result;
    } catch (error) {
        console.error('Error listing sessions:', error);
        return [];
    }
}

/**
 * Update session ops count
 */
export async function incrementSessionOps(sessionId: string): Promise<void> {
    const db = getDb();

    try {
        await db.update(sessions)
            .set({
                ops: sql`${sessions.ops} + 1`,
                updatedAt: new Date(),
            })
            .where(eq(sessions.id, sessionId));
    } catch (error) {
        console.error('Error incrementing session ops:', error);
    }
}

/**
 * Delete a session from database
 */
export async function deleteSessionFromDb(sessionId: string): Promise<boolean> {
    const db = getDb();

    try {
        // Transactions will be deleted automatically due to ON DELETE CASCADE
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return true;
    } catch (error) {
        console.error('Error deleting session:', error);
        return false;
    }
}

// ============ Transaction Operations ============

/**
 * Record a transaction in the database
 */
export async function recordTransaction(tx: Omit<NewTransaction, 'id' | 'createdAt'>): Promise<Transaction | null> {
    const db = getDb();

    try {
        const [result] = await db.insert(transactions).values({
            sessionId: tx.sessionId,
            functionId: tx.functionId,
            sender: tx.sender,
            success: tx.success,
            status: tx.status,
            gasUsed: tx.gasUsed,
            typeArguments: tx.typeArguments,
            args: tx.args,
            events: tx.events,
            writeSet: tx.writeSet,
        }).returning();

        // Increment ops count
        await incrementSessionOps(tx.sessionId);

        return result || null;
    } catch (error) {
        console.error('Error recording transaction:', error);
        return null;
    }
}

/**
 * Get transactions for a session
 */
export async function getSessionTransactions(sessionId: string): Promise<Transaction[]> {
    const db = getDb();

    try {
        const result = await db.select()
            .from(transactions)
            .where(eq(transactions.sessionId, sessionId))
            .orderBy(desc(transactions.createdAt));
        return result;
    } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
    }
}
