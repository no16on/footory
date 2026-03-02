-- ============================================
-- FIX TEAM RLS RECURSION (team_members self-reference)
-- ============================================

-- TEAM_MEMBERS
DROP POLICY IF EXISTS "team_members_member_read" ON team_members;
CREATE POLICY "team_members_member_read" ON team_members FOR SELECT USING (
  user_id = auth.uid()
  OR team_id IN (
    SELECT p.current_team_id
    FROM players p
    WHERE p.user_id = auth.uid()
      AND p.current_team_id IS NOT NULL
  )
);

-- TEAM_ANNOUNCEMENTS
DROP POLICY IF EXISTS "announcements_member_read" ON team_announcements;
CREATE POLICY "announcements_member_read" ON team_announcements FOR SELECT USING (
  team_id IN (
    SELECT p.current_team_id
    FROM players p
    WHERE p.user_id = auth.uid()
      AND p.current_team_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "announcements_staff_insert" ON team_announcements;
CREATE POLICY "announcements_staff_insert" ON team_announcements FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM teams t
    WHERE t.id = team_announcements.team_id
      AND t.created_by = auth.uid()
  )
  OR team_id IN (
    SELECT tm.team_id
    FROM team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'coach', 'manager')
  )
);

-- TEAM_EVENTS
DROP POLICY IF EXISTS "events_member_read" ON team_events;
CREATE POLICY "events_member_read" ON team_events FOR SELECT USING (
  team_id IN (
    SELECT p.current_team_id
    FROM players p
    WHERE p.user_id = auth.uid()
      AND p.current_team_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "events_staff_insert" ON team_events;
CREATE POLICY "events_staff_insert" ON team_events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM teams t
    WHERE t.id = team_events.team_id
      AND t.created_by = auth.uid()
  )
  OR team_id IN (
    SELECT tm.team_id
    FROM team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'coach', 'manager')
  )
);

-- TEAM_EVENT_RSVPS
DROP POLICY IF EXISTS "rsvps_member_read" ON team_event_rsvps;
CREATE POLICY "rsvps_member_read" ON team_event_rsvps FOR SELECT USING (
  event_id IN (
    SELECT te.id
    FROM team_events te
    WHERE te.team_id IN (
      SELECT p.current_team_id
      FROM players p
      WHERE p.user_id = auth.uid()
        AND p.current_team_id IS NOT NULL
    )
  )
);

-- TEAM_MEDIA
DROP POLICY IF EXISTS "team_media_member_read" ON team_media;
CREATE POLICY "team_media_member_read" ON team_media FOR SELECT USING (
  team_id IN (
    SELECT p.current_team_id
    FROM players p
    WHERE p.user_id = auth.uid()
      AND p.current_team_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "team_media_member_insert" ON team_media;
CREATE POLICY "team_media_member_insert" ON team_media FOR INSERT WITH CHECK (
  team_id IN (
    SELECT p.current_team_id
    FROM players p
    WHERE p.user_id = auth.uid()
      AND p.current_team_id IS NOT NULL
  )
);
