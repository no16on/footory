-- ============================================
-- CLIPS (원본 영상)
-- ============================================
CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  source VARCHAR(20) DEFAULT 'personal',
  source_team_id UUID REFERENCES teams(id),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  memo VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HIGHLIGHTS (트림된 하이라이트)
-- ============================================
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  start_seconds NUMERIC(8,2) NOT NULL,
  end_seconds NUMERIC(8,2) NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS
    (CAST(end_seconds - start_seconds AS INTEGER)) STORED,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Max 3 featured highlights per player
CREATE UNIQUE INDEX idx_featured_order
  ON highlights(player_id, featured_order)
  WHERE is_featured = TRUE;
