# FOOTORY — Architecture Document v1.0

> **Last Updated**: 2026-03-02
> **Status**: v1 (MVP)
> **Platform**: Mobile Web App (PWA) → Flutter (v2+)

---

## 1. Tech Stack

### Frontend
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14+ (App Router)** | SSR for public profiles (`/p/{handle}`), CSR for dashboard |
| Language | **TypeScript** | Type safety across the codebase |
| Styling | **Tailwind CSS** | Utility-first, design system friendly |
| State | **Zustand** | Lightweight, simple global state |
| PWA | **next-pwa (serwist)** | Home screen install, offline shell |
| Forms | **React Hook Form + Zod** | Validation with type inference |
| Video Player | **HTML5 `<video>` (v1)** | Simple, no dependency; upgrade to HLS.js if needed |

### Backend / Database
| Layer | Choice | Reason |
|-------|--------|--------|
| BaaS | **Supabase** | PostgreSQL + Auth + Realtime + Edge Functions |
| Database | **PostgreSQL (via Supabase)** | Relational model fits domain (Player↔Team↔Clip↔Tag) |
| Auth | **Supabase Auth + Kakao OAuth** | Korean youth market = Kakao is essential |
| Realtime | **Supabase Realtime** | Team announcements, notifications |
| Server Logic | **Supabase Edge Functions (Deno)** | Medal calculation, video processing triggers |

### Media / Video
| Layer | Choice | Reason |
|-------|--------|--------|
| Storage | **Cloudflare R2** | S3-compatible, **egress $0**, critical for video |
| Trimming (v1) | **FFmpeg via Edge/Worker** | User selects start-end → 30s clip server-side |
| Streaming (v1.5+) | **Cloudflare Stream** | Adaptive bitrate when traffic grows |

### Deployment
| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | **Vercel** | Native Next.js support, edge network |
| Workers | **Cloudflare Workers** | Video processing, R2 access |
| Domain | **Custom domain** | footory.com or similar |

### Tier Plan
| Service | Dev/Beta Phase | Production Phase |
|---------|---------------|-----------------|
| Vercel | **Hobby (Free)** | Pro ($20/mo) — required for commercial use |
| Supabase | **Free** — 500MB DB, 1GB storage | Pro ($25/mo) — no pause, 8GB DB, 100GB storage |
| Cloudflare R2 | **Free** — 10GB storage, 10M reads | Pay-as-you-go ($0.015/GB/mo storage, egress $0) |
| **Total** | **$0/mo** | **~$50/mo + R2 usage** |

---

## 2. Project Structure

```
footory/
├── docs/
│   ├── PRD.md                    # Master PRD (merged spec)
│   ├── ARCHITECTURE.md           # This file
│   ├── DESIGN-SYSTEM.md          # Colors, typography, components
│   └── MEASUREMENT-MEDALS.md     # Medal system spec
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth pages (login, signup)
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx # OAuth callback
│   │   │
│   │   ├── (main)/               # Authenticated layout
│   │   │   ├── layout.tsx        # Bottom nav, auth guard
│   │   │   ├── profile/          # My profile (builder/edit)
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/page.tsx
│   │   │   ├── upload/           # Video upload + trim flow
│   │   │   │   └── page.tsx
│   │   │   ├── tags/             # Tag portfolio
│   │   │   │   ├── page.tsx
│   │   │   │   └── [tagId]/page.tsx
│   │   │   ├── measurements/     # Stats & medals
│   │   │   │   ├── page.tsx
│   │   │   │   └── add/page.tsx
│   │   │   └── team/             # Team hub
│   │   │       ├── page.tsx
│   │   │       ├── [teamId]/
│   │   │       │   ├── page.tsx          # Team home
│   │   │       │   ├── announcements/
│   │   │       │   ├── calendar/
│   │   │       │   ├── media/
│   │   │       │   └── members/
│   │   │       └── create/page.tsx
│   │   │
│   │   ├── p/[handle]/           # PUBLIC profile (SSR, no auth)
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/                  # API Routes
│   │   │   ├── clips/
│   │   │   ├── highlights/
│   │   │   ├── measurements/
│   │   │   └── upload/
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing → redirect to profile or login
│   │
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── StatBar.tsx       # FM-style segmented stat bar
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── VideoTrimmer.tsx  # Start-end selector for 30s clip
│   │   │
│   │   ├── profile/              # Profile-specific components
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── FeaturedHighlights.tsx
│   │   │   ├── MeasuredStats.tsx
│   │   │   ├── TagPortfolio.tsx
│   │   │   ├── SeasonHistory.tsx
│   │   │   └── MedalShowcase.tsx
│   │   │
│   │   ├── team/                 # Team hub components
│   │   │   ├── AnnouncementCard.tsx
│   │   │   ├── CalendarEvent.tsx
│   │   │   ├── MediaGrid.tsx
│   │   │   └── MemberList.tsx
│   │   │
│   │   └── upload/               # Upload flow components
│   │       ├── UploadDropzone.tsx
│   │       ├── TagSelector.tsx
│   │       └── TrimPreview.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client (SSR)
│   │   │   └── middleware.ts     # Auth middleware
│   │   ├── r2/
│   │   │   └── upload.ts         # R2 presigned URL generation
│   │   ├── medals/
│   │   │   └── engine.ts         # Medal evaluation logic
│   │   └── utils/
│   │       ├── format.ts         # Time, stat formatting
│   │       └── constants.ts      # Tags, measurement types
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useProfile.ts
│   │   ├── useClips.ts
│   │   ├── useMeasurements.ts
│   │   └── useTeam.ts
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts
│   │   └── uploadStore.ts
│   │
│   └── types/                    # TypeScript types
│       ├── database.ts           # Supabase generated types
│       ├── profile.ts
│       ├── clip.ts
│       ├── measurement.ts
│       └── team.ts
│
├── supabase/
│   ├── migrations/               # SQL migrations
│   │   ├── 001_players.sql
│   │   ├── 002_clips_highlights.sql
│   │   ├── 003_tags.sql
│   │   ├── 004_measurements_medals.sql
│   │   ├── 005_teams.sql
│   │   └── 006_rls_policies.sql
│   └── functions/                # Edge Functions
│       ├── process-trim/         # FFmpeg trim after upload
│       └── evaluate-medals/      # Medal calculation trigger
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── icons/                    # App icons
│   └── og/                       # OG image templates
│
├── tailwind.config.ts            # Design system tokens
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 3. Database Schema

### Core Tables

```sql
-- ============================================
-- PLAYERS (선수 프로필)
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  handle VARCHAR(30) UNIQUE NOT NULL,         -- /p/{handle}
  display_name VARCHAR(100) NOT NULL,
  birth_year INTEGER,
  position VARCHAR(20),                        -- GK, CB, CM, ST, etc.
  secondary_position VARCHAR(20),
  region VARCHAR(100),                         -- 지역
  current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  current_season_year INTEGER DEFAULT 2026,
  profile_image_url TEXT,
  bio VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handle index for fast public profile lookup
CREATE UNIQUE INDEX idx_players_handle ON players(handle);


-- ============================================
-- CLIPS (원본 영상)
-- ============================================
CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  source VARCHAR(20) DEFAULT 'personal',       -- personal | team
  source_team_id UUID REFERENCES teams(id),    -- if from team
  video_url TEXT NOT NULL,                      -- R2 URL
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  memo VARCHAR(200),                           -- optional note
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upload constraints (enforced at app level):
-- max_duration: 300 seconds (5 minutes)
-- max_file_size: 500MB


-- ============================================
-- HIGHLIGHTS (트림된 하이라이트 클립)
-- ============================================
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,                     -- Trimmed video R2 URL
  thumbnail_url TEXT,
  start_seconds NUMERIC(8,2) NOT NULL,         -- Trim start point
  end_seconds NUMERIC(8,2) NOT NULL,           -- Trim end point
  duration_seconds INTEGER GENERATED ALWAYS AS
    (CAST(end_seconds - start_seconds AS INTEGER)) STORED,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER,                      -- 1, 2, or 3
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Max 3 featured highlights per player
CREATE UNIQUE INDEX idx_featured_order
  ON highlights(player_id, featured_order)
  WHERE is_featured = TRUE;


-- ============================================
-- TAGS (기술 태그 시스템)
-- ============================================
CREATE TABLE tags (
  id VARCHAR(30) PRIMARY KEY,                  -- e.g., '1v1_dribble'
  display_name VARCHAR(50) NOT NULL,           -- e.g., '1v1 돌파'
  display_name_en VARCHAR(50),
  icon VARCHAR(10),                            -- emoji or icon key
  sort_order INTEGER DEFAULT 0
);

-- v1 seed data:
-- 1v1_dribble, heading, shooting, first_touch, forward_pass, 1v1_defense

CREATE TABLE clip_tags (
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
  tag_id VARCHAR(30) REFERENCES tags(id) ON DELETE CASCADE,
  is_top_clip BOOLEAN DEFAULT FALSE,           -- Top 1 representative clip
  PRIMARY KEY (clip_id, tag_id)
);

-- Only one top clip per tag per player
CREATE UNIQUE INDEX idx_top_clip_per_tag
  ON clip_tags(tag_id, is_top_clip)
  WHERE is_top_clip = TRUE;
-- Note: This needs to be scoped to player via clip_id → player_id.
-- We'll enforce this in application logic + RLS.


-- ============================================
-- MEASUREMENTS (측정 기록)
-- ============================================
CREATE TABLE measurement_types (
  id VARCHAR(30) PRIMARY KEY,                  -- e.g., 'JUGGLING'
  display_name VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,                   -- reps, seconds, mm:ss, km/h
  condition_operator VARCHAR(5) NOT NULL,      -- GTE (higher=better) or LTE (lower=better)
  distance_m INTEGER,                          -- for sprint/run types
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- v1 seed: JUGGLING, SPRINT_30M, RUN_1000M, DRIBBLE_SLALOM, SHOT_SPEED(inactive)

CREATE TABLE measurement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  type_id VARCHAR(30) REFERENCES measurement_types(id) NOT NULL,
  value_display VARCHAR(20) NOT NULL,          -- "5.02", "04:10", "100"
  value_normalized NUMERIC(10,2) NOT NULL,     -- seconds/reps/kmh (for sorting/medals)
  attempt_context VARCHAR(20),                 -- TRAINING, MATCH, TEST
  recorded_at DATE NOT NULL,
  location VARCHAR(100),
  note VARCHAR(200),
  evidence_media_url TEXT,                     -- R2 URL (video/image)
  verification_status VARCHAR(20) DEFAULT 'CLAIMED',  -- CLAIMED | VERIFIED_TEAM
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- MEDALS (메달 시스템)
-- ============================================
CREATE TABLE medal_rules (
  id VARCHAR(50) PRIMARY KEY,                  -- e.g., 'JUGGLING_100'
  type_id VARCHAR(30) REFERENCES measurement_types(id) NOT NULL,
  display_name VARCHAR(50) NOT NULL,           -- "Juggling 100"
  threshold_value NUMERIC(10,2) NOT NULL,      -- normalized threshold
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE player_medals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  medal_rule_id VARCHAR(50) REFERENCES medal_rules(id) NOT NULL,
  earned_from_record_id UUID REFERENCES measurement_records(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  verification_status_snapshot VARCHAR(20),
  is_featured BOOLEAN DEFAULT FALSE,           -- Show on profile (max 5)
  UNIQUE(player_id, medal_rule_id)             -- No duplicate medals
);


-- ============================================
-- SEASONS (시즌 커리어)
-- ============================================
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  team_id UUID REFERENCES teams(id),
  team_name_snapshot VARCHAR(100),             -- In case team is deleted
  competitions VARCHAR(200),                   -- Optional: tournament names
  notes VARCHAR(200),
  representative_highlight_id UUID REFERENCES highlights(id),
  UNIQUE(player_id, year)
);


-- ============================================
-- TEAMS (팀 허브)
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  logo_url TEXT,
  region VARCHAR(100),
  season_year INTEGER DEFAULT 2026,
  invite_code VARCHAR(10) UNIQUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'player',           -- owner, coach, manager, player
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  event_type VARCHAR(20) DEFAULT 'training',   -- training, match, other
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location VARCHAR(200),
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_event_rsvps (
  event_id UUID REFERENCES team_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL,                 -- going, maybe, no
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE team_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  media_type VARCHAR(10) NOT NULL,             -- photo, video
  media_url TEXT NOT NULL,                     -- R2 URL
  thumbnail_url TEXT,
  caption VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Public profiles: anyone can read
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON players FOR SELECT USING (true);
CREATE POLICY "Owner update" ON players FOR UPDATE USING (auth.uid() = user_id);

-- Clips: owner can CRUD, anyone can read
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON clips FOR SELECT USING (true);
CREATE POLICY "Owner insert" ON clips FOR INSERT WITH CHECK (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "Owner delete" ON clips FOR DELETE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- Team: members can read, owner/coach can write
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members read" ON team_announcements FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Coach/owner write" ON team_announcements FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'coach', 'manager')
  )
);
```

---

## 4. Auth Flow (Kakao SSO)

```
User taps "카카오로 시작하기"
  → Supabase Auth: signInWithOAuth({ provider: 'kakao' })
  → Redirect to Kakao login
  → Callback to /auth/callback
  → Supabase creates/updates auth.users record
  → Check if players record exists for this user_id
    → No: redirect to /profile/onboarding (handle + basic info)
    → Yes: redirect to /profile
```

### Supabase Kakao OAuth Setup
1. Kakao Developers Console → Create app → Get REST API Key + Client Secret
2. Supabase Dashboard → Auth → Providers → Enable Kakao
3. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

---

## 5. Video Upload & Trim Pipeline (v1)

```
1. User selects video file (max 5min, 500MB)
   ↓
2. Client generates presigned URL from API
   POST /api/upload/presign → returns R2 presigned PUT URL
   ↓
3. Client uploads directly to R2 (no server bottleneck)
   PUT {presigned_url} with video file
   ↓
4. Client creates Clip record in Supabase
   INSERT INTO clips (player_id, video_url, ...)
   ↓
5. User watches video and selects 30s trim range
   - VideoTrimmer component: start/end slider
   - Preview plays selected range
   ↓
6. User confirms trim → API call
   POST /api/highlights/trim { clipId, startSeconds, endSeconds }
   ↓
7. Server (Edge Function or Cloudflare Worker):
   - Download from R2
   - FFmpeg trim: ffmpeg -i input.mp4 -ss {start} -t 30 -c copy output.mp4
   - Upload trimmed file to R2
   - INSERT INTO highlights (clip_id, video_url, start_seconds, end_seconds)
   ↓
8. User can set highlight as Featured or link to Tag
```

### Upload Constraints (v1)
| Constraint | Value | Enforcement |
|------------|-------|-------------|
| Max duration | 300 seconds (5 min) | Client-side check + server validation |
| Max file size | 500 MB | Client-side check + R2 presigned URL config |
| Allowed formats | MP4, MOV, WebM | Client-side MIME check |
| Highlight trim | Max 30 seconds | UI slider constraint |
| Featured slots | Max 3 | DB unique index |

---

## 6. Medal Evaluation Logic

```typescript
// lib/medals/engine.ts (simplified)

async function evaluateMedals(playerId: string, record: MeasurementRecord) {
  // 1. Get active rules for this measurement type
  const rules = await supabase
    .from('medal_rules')
    .select('*')
    .eq('type_id', record.type_id)
    .eq('is_active', true);

  // 2. Get player's existing medals
  const existing = await supabase
    .from('player_medals')
    .select('medal_rule_id')
    .eq('player_id', playerId);

  const existingIds = new Set(existing.data.map(m => m.medal_rule_id));

  // 3. Check each rule
  const type = await getMeasurementType(record.type_id);
  const newMedals = [];

  for (const rule of rules.data) {
    if (existingIds.has(rule.id)) continue; // Already earned

    const passes = type.condition_operator === 'GTE'
      ? record.value_normalized >= rule.threshold_value
      : record.value_normalized <= rule.threshold_value;

    if (passes) {
      newMedals.push({
        player_id: playerId,
        medal_rule_id: rule.id,
        earned_from_record_id: record.id,
        verification_status_snapshot: record.verification_status,
      });
    }
  }

  // 4. Insert new medals
  if (newMedals.length > 0) {
    await supabase.from('player_medals').insert(newMedals);
  }

  return newMedals;
}
```

---

## 7. API Routes Summary (v1)

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | `/p/[handle]` | Public profile (SSR page) |
| GET | `/api/profile/me` | Current user's profile |
| PUT | `/api/profile/me` | Update profile |
| POST | `/api/profile/handle-check` | Check handle availability |

### Clips & Highlights
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload/presign` | Get R2 presigned URL |
| POST | `/api/clips` | Create clip record |
| DELETE | `/api/clips/[id]` | Delete clip |
| POST | `/api/highlights/trim` | Trim clip → create highlight |
| PUT | `/api/highlights/[id]/feature` | Set/unset as featured |

### Tags
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tags` | List all tags |
| GET | `/api/tags/[tagId]/clips` | Get clips for a tag |
| PUT | `/api/clips/[clipId]/tags/[tagId]/top` | Set as top clip |

### Measurements & Medals
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/measurements` | Add measurement record |
| GET | `/api/measurements/[typeId]` | Get records for type |
| GET | `/api/medals/me` | Get my medals |
| PUT | `/api/medals/[id]/feature` | Toggle medal featured |

### Team
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/teams` | Create team |
| POST | `/api/teams/join` | Join via invite code |
| GET | `/api/teams/[id]` | Team details |
| POST | `/api/teams/[id]/announcements` | Create announcement |
| POST | `/api/teams/[id]/events` | Create event |
| PUT | `/api/teams/[id]/events/[eventId]/rsvp` | RSVP |
| POST | `/api/teams/[id]/media` | Upload team media |
| POST | `/api/teams/[id]/media/[mediaId]/claim` | "내 프로필로 가져오기" |

---

## 8. Key Architecture Decisions

### D1: Video Storage Separation
- **Decision**: R2 for video, Supabase for metadata only
- **Reason**: Supabase Storage is not optimized for large video files. R2's $0 egress is critical for video-heavy service.

### D2: Client-Direct Upload
- **Decision**: Upload video directly from client to R2 via presigned URL
- **Reason**: Avoids Vercel's 4.5MB request limit and server memory pressure.

### D3: Server-Side Trim Only
- **Decision**: FFmpeg trim runs server-side (Edge Function or Worker), not client-side
- **Reason**: Consistent output quality, works on all mobile devices.

### D4: Medal Engine in Application Layer
- **Decision**: Medal evaluation logic in TypeScript, not DB triggers
- **Reason**: Easier to test, debug, and iterate on rules.

### D5: Public Profile as SSR
- **Decision**: `/p/{handle}` uses Next.js SSR with Supabase server client
- **Reason**: SEO for scout/school discovery, fast OG meta for social sharing.

### D6: Kakao-First Auth
- **Decision**: Kakao OAuth as primary login method
- **Reason**: Korean youth market. Add Apple/Google later.

---

## 9. Sprint Roadmap (v1)

| Sprint | Focus | Modules | Duration |
|--------|-------|---------|----------|
| **S0** | Infra + Skeleton | Project setup, DB migration, Auth (Kakao), Layout, Design system components | 1 week |
| **S1** | Profile Core | Module A (Profile view + edit + public URL + share) | 1 week |
| **S2** | Video + Highlight | Module B (Upload, trim, featured pin) | 1.5 weeks |
| **S3** | Tag Portfolio | Module C (6 tags, clip library, top clip) | 1 week |
| **S4** | Measurements + Medals | Module D + Medals (Record CRUD, medal engine, showcase) | 1 week |
| **S5** | Team Hub | Module F (Create/join, announcements, calendar, media, "Add to profile") | 1.5 weeks |
| **S6** | Integration + Polish | Module G (Scout view), QA, PWA manifest, OG images, performance | 1 week |

**Total estimated: ~8 weeks**

---

## 10. Future Considerations (v2+)

- **Flutter native app**: Share business logic via API; rebuild UI in Flutter
- **AI Auto-Highlight**: Replace manual trim with scene detection (Twelve Labs / custom model)
- **Cloudflare Stream**: Adaptive bitrate streaming when traffic justifies cost
- **Discover/Scout**: Search + filter players by position, region, tag, stats
- **Monthly Best / MVP**: Community voting system
- **Push notifications**: Firebase Cloud Messaging (PWA) or native push (Flutter)
