-- Wingmen Vision Supabase Schema
-- Tables: cameras, security_events, evidence, threats, deployment_guide
CREATE TABLE IF NOT EXISTS cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  status TEXT DEFAULT 'offline',
  ip_address INET,
  stream_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  device_id TEXT REFERENCES cameras(device_id),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'low',
  timestamp TIMESTAMP DEFAULT now(),
  ai_labels TEXT[],
  evidence_ids UUID[]
);

CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id TEXT UNIQUE NOT NULL,
  event_id TEXT REFERENCES security_events(event_id),
  timestamp TIMESTAMP DEFAULT now(),
  type TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_id TEXT UNIQUE NOT NULL,
  device_id TEXT,
  type TEXT NOT NULL,
  details TEXT,
  signal_info JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT now()
);
