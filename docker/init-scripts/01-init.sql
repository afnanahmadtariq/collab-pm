-- =============================================================================
-- PostgreSQL Initialization Script
-- =============================================================================
-- This script runs when the PostgreSQL container is first created
-- Add any initial setup, extensions, or seed data here
-- =============================================================================

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search optimization

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;
