/**
 * Drizzle ORM database client
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database client singleton
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let client: ReturnType<typeof postgres> | null = null;

/**
 * Get the database connection URL from environment
 */
function getDatabaseUrl(): string {
    // Try DATABASE_URL first (standard), then construct from Supabase env vars
    const databaseUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL:', databaseUrl);
    if (databaseUrl) {
        return databaseUrl;
    }

    // Construct from Supabase project URL
    // Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

    if (supabaseUrl && supabaseDbPassword) {
        // Extract project ref from supabase URL (e.g., https://xyz.supabase.co -> xyz)
        const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
        if (match) {
            const projectRef = match[1];
            return `postgresql://postgres.${projectRef}:${supabaseDbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
        }
    }

    throw new Error('Missing DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD environment variables');
}

/**
 * Initialize and get the Drizzle database client
 */
export function getDb() {
    if (db) return db;

    const databaseUrl = getDatabaseUrl();

    // Create postgres client with connection pooling
    client = postgres(databaseUrl, {
        max: 10, // Maximum number of connections
        idle_timeout: 20,
        connect_timeout: 10,
    });

    // Create drizzle instance with schema
    db = drizzle(client, { schema });

    console.log('Drizzle database connection initialized');
    return db;
}

/**
 * Close the database connection (for graceful shutdown)
 */
export async function closeDb() {
    if (client) {
        await client.end();
        client = null;
        db = null;
        console.log('Database connection closed');
    }
}

// Re-export schema for convenience
export * from './schema';
