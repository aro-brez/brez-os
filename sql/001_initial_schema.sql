-- ============================================
-- BRĒZ AI Database Schema
-- Migration: 001_initial_schema
-- ============================================
-- Run this in your Supabase SQL Editor to set up the database.
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS & USERS
-- ============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHANNELS & MESSAGES
-- ============================================

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reactions JSONB DEFAULT '{}',
  mentions UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOALS & TASKS
-- ============================================

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  due_date DATE,
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'completed', 'cancelled')),
  impact_score INTEGER DEFAULT 5 CHECK (impact_score >= 1 AND impact_score <= 10),
  metric_target TEXT,
  metric_current NUMERIC,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  assignee_id UUID REFERENCES auth.users(id),
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'done', 'cancelled')),
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FILES & DOCUMENTS
-- ============================================

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'google_drive', 'shopify', 'api')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  linked_channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  linked_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  linked_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCIAL DATA
-- ============================================

-- Financial snapshots
CREATE TABLE IF NOT EXISTS finance_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cash_on_hand NUMERIC NOT NULL,
  ap_due_2w NUMERIC DEFAULT 0,
  ar_expected_2w NUMERIC DEFAULT 0,
  fixed_weekly_stack NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, date)
);

-- Growth scenarios (simulation configs)
CREATE TABLE IF NOT EXISTS growth_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  inputs JSONB NOT NULL,
  is_baseline BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation runs
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES growth_scenarios(id) ON DELETE SET NULL,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  go_no_go BOOLEAN,
  min_cash NUMERIC,
  trough_week INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS & AUDIT LOG
-- ============================================

-- Events table (for activity feed and audit)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_channels_org ON channels(org_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_org ON goals(org_id);
CREATE INDEX IF NOT EXISTS idx_goals_owner ON goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_files_org ON files(org_id);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['orgs', 'memberships', 'profiles', 'channels', 'messages', 'goals', 'tasks', 'files', 'growth_scenarios'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trigger_updated_at ON %I', tbl);
    EXECUTE format('CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl);
  END LOOP;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'BRĒZ AI schema created successfully!' AS result;
