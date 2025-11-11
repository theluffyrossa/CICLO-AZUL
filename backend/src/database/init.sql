-- CICLO AZUL Database Initialization Script
-- This script runs when the PostgreSQL container is first created

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collection_status') THEN
    CREATE TYPE collection_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'waste_category') THEN
    CREATE TYPE waste_category AS ENUM ('ORGANIC', 'RECYCLABLE', 'HAZARDOUS', 'ELECTRONIC', 'CONSTRUCTION', 'OTHER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'legal_basis') THEN
    CREATE TYPE legal_basis AS ENUM ('CONSENT', 'LEGITIMATE_INTEREST', 'LEGAL_OBLIGATION', 'CONTRACT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gravimetric_source') THEN
    CREATE TYPE gravimetric_source AS ENUM ('MANUAL', 'CSV_IMPORT', 'API', 'SCALE');
  END IF;
END $$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE cicloazul TO cicloazul;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cicloazul;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cicloazul;
