-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- PLAYERS: 공개 읽기, 본인만 수정
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_public_read" ON players FOR SELECT USING (true);
CREATE POLICY "players_owner_insert" ON players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "players_owner_update" ON players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "players_owner_delete" ON players FOR DELETE USING (auth.uid() = user_id);

-- CLIPS: 공개 읽기, 본인만 CUD
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clips_public_read" ON clips FOR SELECT USING (true);
CREATE POLICY "clips_owner_insert" ON clips FOR INSERT WITH CHECK (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "clips_owner_update" ON clips FOR UPDATE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "clips_owner_delete" ON clips FOR DELETE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- HIGHLIGHTS: 공개 읽기, 본인만 CUD
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "highlights_public_read" ON highlights FOR SELECT USING (true);
CREATE POLICY "highlights_owner_insert" ON highlights FOR INSERT WITH CHECK (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "highlights_owner_update" ON highlights FOR UPDATE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "highlights_owner_delete" ON highlights FOR DELETE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- CLIP_TAGS: 공개 읽기, 본인만 CUD
ALTER TABLE clip_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clip_tags_public_read" ON clip_tags FOR SELECT USING (true);
CREATE POLICY "clip_tags_owner_insert" ON clip_tags FOR INSERT WITH CHECK (
  clip_id IN (
    SELECT c.id FROM clips c
    JOIN players p ON p.id = c.player_id
    WHERE p.user_id = auth.uid()
  )
);
CREATE POLICY "clip_tags_owner_delete" ON clip_tags FOR DELETE USING (
  clip_id IN (
    SELECT c.id FROM clips c
    JOIN players p ON p.id = c.player_id
    WHERE p.user_id = auth.uid()
  )
);

-- TAGS: 전체 공개 읽기 (시드 데이터)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_public_read" ON tags FOR SELECT USING (true);

-- MEASUREMENT_TYPES: 전체 공개 읽기
ALTER TABLE measurement_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurement_types_public_read" ON measurement_types FOR SELECT USING (true);

-- MEASUREMENT_RECORDS: 공개 읽기, 본인만 CUD
ALTER TABLE measurement_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurements_public_read" ON measurement_records FOR SELECT USING (true);
CREATE POLICY "measurements_owner_insert" ON measurement_records FOR INSERT WITH CHECK (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "measurements_owner_update" ON measurement_records FOR UPDATE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "measurements_owner_delete" ON measurement_records FOR DELETE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- MEDAL_RULES: 전체 공개 읽기
ALTER TABLE medal_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medal_rules_public_read" ON medal_rules FOR SELECT USING (true);

-- PLAYER_MEDALS: 공개 읽기, 시스템 삽입 (서버만)
ALTER TABLE player_medals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "player_medals_public_read" ON player_medals FOR SELECT USING (true);
CREATE POLICY "player_medals_owner_update" ON player_medals FOR UPDATE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- SEASONS: 공개 읽기, 본인만 CUD
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seasons_public_read" ON seasons FOR SELECT USING (true);
CREATE POLICY "seasons_owner_insert" ON seasons FOR INSERT WITH CHECK (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "seasons_owner_update" ON seasons FOR UPDATE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "seasons_owner_delete" ON seasons FOR DELETE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- TEAMS: 공개 읽기, 생성자만 수정
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_public_read" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_owner_insert" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "teams_owner_update" ON teams FOR UPDATE USING (auth.uid() = created_by);

-- TEAM_MEMBERS: 멤버만 읽기, 본인 자신 join/leave
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_member_read" ON team_members FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "team_members_self_insert" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "team_members_self_delete" ON team_members FOR DELETE USING (auth.uid() = user_id);

-- TEAM_ANNOUNCEMENTS: 멤버만 읽기, 코치/오너/매니저만 작성
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements_member_read" ON team_announcements FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "announcements_staff_insert" ON team_announcements FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'coach', 'manager')
  )
);

-- TEAM_EVENTS: 멤버만 읽기, 코치/오너/매니저만 작성
ALTER TABLE team_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_member_read" ON team_events FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "events_staff_insert" ON team_events FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'coach', 'manager')
  )
);

-- TEAM_EVENT_RSVPS: 멤버 읽기, 본인 RSVP
ALTER TABLE team_event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvps_member_read" ON team_event_rsvps FOR SELECT USING (
  event_id IN (
    SELECT te.id FROM team_events te
    JOIN team_members tm ON tm.team_id = te.team_id
    WHERE tm.user_id = auth.uid()
  )
);
CREATE POLICY "rsvps_self_upsert" ON team_event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rsvps_self_update" ON team_event_rsvps FOR UPDATE USING (auth.uid() = user_id);

-- TEAM_MEDIA: 멤버 읽기, 멤버 업로드
ALTER TABLE team_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_media_member_read" ON team_media FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "team_media_member_insert" ON team_media FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
