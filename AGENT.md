
## Project Overview
Footory는 유소년 축구 선수의 커리어 프로필 OS다. LinkedIn형 공개 프로필 + 영상 기반 실력 증거(하이라이트) + Band형 팀 허브를 하나로 묶는 모바일웹앱(PWA).

## ⚠️ ALWAYS Read These Docs First
코드를 작성하기 전에 반드시 아래 문서를 읽어라:
- `docs/ARCHITECTURE.md` — 기술 스택, DB 스키마, API 설계, 폴더 구조, 스프린트 로드맵
- `docs/DESIGN-SYSTEM.md` — 색상, 타이포, 스페이싱, 컴포넌트 스펙, Tailwind 설정
- `docs/PRD.md` — 기획/기능명세 (존재할 경우)

## Tech Stack
- **Framework**: Next.js 14+ (App Router), TypeScript
- **Styling**: Tailwind CSS (design system tokens in tailwind.config.ts)
- **State**: Zustand
- **DB/Auth**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Auth**: Kakao OAuth (primary), Apple/Google (later)
- **Video Storage**: Cloudflare R2 (egress $0)
- **Video Trimming**: FFmpeg (server-side, v1은 사용자 수동 트림)
- **Deployment**: Vercel
- **PWA**: next-pwa (serwist)

## Product DNA (절대 규칙 — 이 규칙을 깨는 코드를 쓰지 마라)
- [LOCK-01] Home = Profile. 피드가 아니라 프로필이 메인이다.
- [LOCK-02] Evidence > Opinion. 코치 주관 점수/별점/총점 금지.
- [LOCK-03] Video-first. 영상이 근거이며 하이라이트가 엔진.
- [LOCK-04] Skill = Tag Portfolio. 점수화가 아니라 증거 영상 모음.
- [LOCK-05] Team is Context, not Identity. 선수 프로필은 팀에 종속되지 않는다.
- [LOCK-06] Weekly 없음. 월간 베스트/MVP는 v2+.
- [LOCK-07] Public-only (v1).

## Design Rules
### Theme: "Footory Dark (FM Gold)"
- **절대 밝은 배경 쓰지 마라.** 다크 모드 전용.
- **순수 흰색(#FFF) 금지** → `#F4F2EA` (warm white) 사용
- **순수 검정(#000) 금지** → `#0B0E11` 사용
- Surface hierarchy: `bg(#0B0E11)` → `surface(#12160F)` → `card(#1A1E16)` 순서를 절대 건너뛰지 마라.

### Fonts (Google Fonts)
- Body/UI: `DM Sans` (sans)
- Headings/Display: `Sora` (display)
- Numbers/Labels/Stats: `JetBrains Mono` (mono)

### Key Colors
- Accent (Gold): `#D4A843`, Light: `#F0D078`, Dim: `rgba(212,168,67,0.12)`
- Gold Gradient: `linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)`
- Green: `#6BCB77`, Orange: `#E8943A`, Red: `#E85D5D`, Cyan: `#5BBFCF`
- Position Colors: CF=#E85D5D, AM=#E8943A, CM=#D4A843, DM=#6BCB77, DEF=#5B9ECF, GK=#B088CF

### Component Patterns
- 섹션 헤더: FM 스타일 — UPPERCASE mono 라벨(10px, textDim, letterSpacing 1.5px) + Sora 서브타이틀(14px, 700)
- 버튼 Primary: 골드 그라디언트 + shadow `0 4px 20px rgba(212,168,67,0.25)` + 텍스트 `#0B0E11`
- 카드: `card` bg + `border` 1px solid + radius 12px
- 칩/태그: pill shape radius 20px, active 시 color 기반 dim bg
- 아바타: **둥근 사각형** (borderRadius: size*0.28), **원형 아님**
- StatBar: 세그먼트 5개, gap 3px, 각 14x6px, glow shadow
- 숫자/통계: 항상 `fontDisplay` (Sora) + 큰 사이즈 + fontWeight 900

## Code Style
- TypeScript strict mode
- 컴포넌트는 함수형 + hooks
- 파일명: kebab-case (e.g., `player-card.tsx`)
- 컴포넌트명: PascalCase (e.g., `PlayerCard`)
- 경로 alias: `@/` → `src/`
- API 응답: 항상 `{ data, error }` 패턴
- Supabase 타입: `src/types/database.ts`에서 자동 생성 타입 사용

## Folder Structure (요약)
```
src/
├── app/           # Next.js App Router pages
│   ├── (auth)/    # Login, callback
│   ├── (main)/    # Authenticated pages (profile, upload, tags, measurements, team)
│   ├── p/[handle]/ # Public profile (SSR, no auth required)
│   └── api/       # API routes
├── components/
│   ├── ui/        # Design system primitives (Button, Card, Input, StatBar, etc.)
│   ├── profile/   # Profile-specific components
│   ├── team/      # Team hub components
│   └── upload/    # Upload flow components
├── lib/
│   ├── supabase/  # Client, server, middleware
│   ├── r2/        # R2 presigned URL helpers
│   └── medals/    # Medal evaluation engine
├── hooks/         # Custom React hooks
├── stores/        # Zustand stores
└── types/         # TypeScript type definitions
```

## Database
- 11 tables: players, clips, highlights, tags, clip_tags, measurement_types, measurement_records, medal_rules, player_medals, seasons, teams + team_members/announcements/events/rsvps/media
- RLS 필수: 공개 프로필은 누구나 읽기, 수정은 본인만
- 상세 스키마: `docs/ARCHITECTURE.md` Section 3 참조

## Upload Constraints (v1)
- 영상 최대 길이: 5분 (300초)
- 파일 최대 크기: 500MB
- 허용 포맷: MP4, MOV, WebM
- 하이라이트 트림: 최대 30초
- Featured 슬롯: 최대 3개

## Sprint Plan
- S0: Infra + Auth + Layout + Design System components
- S1: Profile (Module A)
- S2: Video Upload + Trim (Module B)
- S3: Tag Portfolio (Module C)
- S4: Measurements + Medals (Module D)
- S5: Team Hub (Module F)
- S6: Integration + Polish (Module G)

## Common Mistakes to Avoid
- Supabase client를 서버 컴포넌트에서 쓰지 마라 → `createServerClient` 사용
- R2 업로드를 서버를 통하지 마라 → presigned URL로 클라이언트 직접 업로드
- `use client`를 page.tsx 최상단에 남발하지 마라 → 필요한 컴포넌트만 client component로
- Tailwind 클래스 외에 인라인 스타일 쓰지 마라 (프로토타입 JSX는 인라인이지만, 실제 코드는 Tailwind)
- 이미지/비디오 URL을 DB에 절대경로로 저장하지 마라 → R2 key만 저장하고 서빙 URL은 런타임 생성
