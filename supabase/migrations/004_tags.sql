-- ============================================
-- TAGS (기술 태그)
-- ============================================
CREATE TABLE tags (
  id VARCHAR(30) PRIMARY KEY,
  display_name VARCHAR(50) NOT NULL,
  display_name_en VARCHAR(50),
  icon VARCHAR(10),
  sort_order INTEGER DEFAULT 0
);

-- v1 seed data
INSERT INTO tags (id, display_name, display_name_en, icon, sort_order) VALUES
  ('1v1_dribble', '1v1 돌파', '1v1 Dribble', '⚡', 1),
  ('shooting', '슈팅', 'Shooting', '🎯', 2),
  ('heading', '헤딩경합', 'Heading', '💪', 3),
  ('first_touch', '퍼스트터치', 'First Touch', '✨', 4),
  ('forward_pass', '전진패스', 'Forward Pass', '🎯', 5),
  ('1v1_defense', '1v1 수비', '1v1 Defense', '🛡️', 6);

-- ============================================
-- CLIP_TAGS (영상-태그 연결)
-- ============================================
CREATE TABLE clip_tags (
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
  tag_id VARCHAR(30) REFERENCES tags(id) ON DELETE CASCADE,
  is_top_clip BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (clip_id, tag_id)
);

-- Only one top clip per tag per player (enforced at app level + here)
CREATE UNIQUE INDEX idx_top_clip_per_tag
  ON clip_tags(tag_id, is_top_clip)
  WHERE is_top_clip = TRUE;

-- ============================================
-- SEASONS (시즌 커리어)
-- ============================================
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  team_id UUID REFERENCES teams(id),
  team_name_snapshot VARCHAR(100),
  competitions VARCHAR(200),
  notes VARCHAR(200),
  representative_highlight_id UUID REFERENCES highlights(id),
  UNIQUE(player_id, year)
);
