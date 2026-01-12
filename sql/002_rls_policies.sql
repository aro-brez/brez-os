-- ============================================
-- BRĒZ AI Row Level Security (RLS) Policies
-- Migration: 002_rls_policies
-- ============================================
-- Run this AFTER 001_initial_schema.sql
-- These policies ensure users can only access their organization's data.
-- ============================================

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check org membership
-- ============================================

CREATE OR REPLACE FUNCTION is_org_member(org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = org_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin(org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = org_uuid
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- ORGS POLICIES
-- ============================================

CREATE POLICY "Members can view their orgs"
  ON orgs FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Admins can update their orgs"
  ON orgs FOR UPDATE
  USING (is_org_admin(id));

-- ============================================
-- MEMBERSHIPS POLICIES
-- ============================================

CREATE POLICY "Members can view org memberships"
  ON memberships FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can manage memberships"
  ON memberships FOR ALL
  USING (is_org_admin(org_id));

-- ============================================
-- CHANNELS POLICIES
-- ============================================

CREATE POLICY "Members can view channels"
  ON channels FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can create channels"
  ON channels FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Admins can update channels"
  ON channels FOR UPDATE
  USING (is_org_admin(org_id));

CREATE POLICY "Admins can delete channels"
  ON channels FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================
-- MESSAGES POLICIES
-- ============================================

CREATE POLICY "Members can view messages"
  ON messages FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can create messages"
  ON messages FOR INSERT
  WITH CHECK (is_org_member(org_id) AND user_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (user_id = auth.uid() OR is_org_admin(org_id));

-- ============================================
-- GOALS POLICIES
-- ============================================

CREATE POLICY "Members can view goals"
  ON goals FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can create goals"
  ON goals FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Members can update goals"
  ON goals FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "Admins can delete goals"
  ON goals FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================
-- TASKS POLICIES
-- ============================================

CREATE POLICY "Members can view tasks"
  ON tasks FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Members can update tasks"
  ON tasks FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "Admins can delete tasks"
  ON tasks FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================
-- TASK COMMENTS POLICIES
-- ============================================

CREATE POLICY "Members can view task comments"
  ON task_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_id
    AND is_org_member(t.org_id)
  ));

CREATE POLICY "Members can create task comments"
  ON task_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_id
    AND is_org_member(t.org_id)
  ) AND user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON task_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON task_comments FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- FILES POLICIES
-- ============================================

CREATE POLICY "Members can view files"
  ON files FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can upload files"
  ON files FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Members can update files"
  ON files FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "Admins can delete files"
  ON files FOR DELETE
  USING (is_org_admin(org_id) OR uploaded_by = auth.uid());

-- ============================================
-- FINANCE POLICIES
-- ============================================

CREATE POLICY "Members can view finance snapshots"
  ON finance_snapshots FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can manage finance snapshots"
  ON finance_snapshots FOR ALL
  USING (is_org_admin(org_id));

-- ============================================
-- GROWTH SCENARIOS POLICIES
-- ============================================

CREATE POLICY "Members can view scenarios"
  ON growth_scenarios FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can create scenarios"
  ON growth_scenarios FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "Creators can update their scenarios"
  ON growth_scenarios FOR UPDATE
  USING (created_by = auth.uid() OR is_org_admin(org_id));

CREATE POLICY "Creators can delete their scenarios"
  ON growth_scenarios FOR DELETE
  USING (created_by = auth.uid() OR is_org_admin(org_id));

-- ============================================
-- SIMULATIONS POLICIES
-- ============================================

CREATE POLICY "Members can view simulations"
  ON simulations FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Members can create simulations"
  ON simulations FOR INSERT
  WITH CHECK (is_org_member(org_id));

-- ============================================
-- EVENTS POLICIES
-- ============================================

CREATE POLICY "Members can view events"
  ON events FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "System can insert events"
  ON events FOR INSERT
  WITH CHECK (is_org_member(org_id));

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'BRĒZ AI RLS policies created successfully!' AS result;
