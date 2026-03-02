-- ============================================
-- MEASUREMENT_TYPES
-- ============================================
CREATE TABLE measurement_types (
  id VARCHAR(30) PRIMARY KEY,
  display_name VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  condition_operator VARCHAR(5) NOT NULL, -- GTE or LTE
  distance_m INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- v1 seed
INSERT INTO measurement_types (id, display_name, unit, condition_operator, sort_order, is_active) VALUES
  ('JUGGLING',       '저글링',        'reps',    'GTE', 1, TRUE),
  ('SPRINT_30M',     '30m 스프린트',  'seconds', 'LTE', 2, TRUE),
  ('RUN_1000M',      '1000m 달리기',  'mm:ss',   'LTE', 3, TRUE),
  ('DRIBBLE_SLALOM', '드리블 슬라롬', 'seconds', 'LTE', 4, TRUE),
  ('SHOT_SPEED',     '슈팅 속도',     'km/h',    'GTE', 5, FALSE);

-- ============================================
-- MEASUREMENT_RECORDS
-- ============================================
CREATE TABLE measurement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  type_id VARCHAR(30) REFERENCES measurement_types(id) NOT NULL,
  value_display VARCHAR(20) NOT NULL,
  value_normalized NUMERIC(10,2) NOT NULL,
  attempt_context VARCHAR(20),
  recorded_at DATE NOT NULL,
  location VARCHAR(100),
  note VARCHAR(200),
  evidence_media_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'CLAIMED',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDAL_RULES
-- ============================================
CREATE TABLE medal_rules (
  id VARCHAR(50) PRIMARY KEY,
  type_id VARCHAR(30) REFERENCES measurement_types(id) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  threshold_value NUMERIC(10,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- v1 seed
INSERT INTO medal_rules (id, type_id, display_name, threshold_value, sort_order) VALUES
  ('JUGGLING_50',    'JUGGLING',       'Juggling 50',    50,   1),
  ('JUGGLING_100',   'JUGGLING',       'Juggling 100',   100,  2),
  ('JUGGLING_200',   'JUGGLING',       'Juggling 200',   200,  3),
  ('SPRINT_30M_5S',  'SPRINT_30M',     '30m 5초대',      5.99, 4),
  ('SPRINT_30M_45S', 'SPRINT_30M',     '30m 4.5초',      4.50, 5),
  ('RUN_1000M_4MIN', 'RUN_1000M',      '1000m 4분대',    270,  6);

-- ============================================
-- PLAYER_MEDALS
-- ============================================
CREATE TABLE player_medals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  medal_rule_id VARCHAR(50) REFERENCES medal_rules(id) NOT NULL,
  earned_from_record_id UUID REFERENCES measurement_records(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  verification_status_snapshot VARCHAR(20),
  is_featured BOOLEAN DEFAULT FALSE,
  UNIQUE(player_id, medal_rule_id)
);
