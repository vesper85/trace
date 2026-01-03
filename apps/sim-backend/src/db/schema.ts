/**
 * Drizzle ORM database schema for sim-backend
 */

import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

// Sessions table
export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    network: text('network', { enum: ['movement-mainnet', 'movement-testnet', 'custom'] }).notNull(),
    nodeUrl: text('node_url').notNull(),
    networkVersion: integer('network_version'),
    apiKey: text('api_key'),
    ops: integer('ops').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
    functionId: text('function_id').notNull(),
    sender: text('sender').notNull(),
    success: boolean('success').notNull(),
    status: text('status').notNull(),
    gasUsed: integer('gas_used').notNull(),
    typeArguments: jsonb('type_arguments').$type<string[]>(),
    args: jsonb('args').$type<string[]>(),
    events: jsonb('events'),
    writeSet: jsonb('write_set'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Type exports for use in application code
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
