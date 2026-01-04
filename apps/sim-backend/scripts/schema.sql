-- Supabase SQL Schema for VirtualNet Sessions
-- Run this in Supabase SQL Editor to create the required tables

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    network TEXT NOT NULL CHECK (network IN ('movement-mainnet', 'movement-testnet', 'custom')),
    node_url TEXT NOT NULL,
    network_version INTEGER,
    api_key TEXT,
    ops INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    function_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'Executed',
    gas_used INTEGER DEFAULT 0,
    type_arguments JSONB,
    args JSONB,
    events JSONB,
    write_set JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- Enable Row Level Security (optional, for production)
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for sessions updated_at
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
