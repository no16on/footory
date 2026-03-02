# FOOTORY — Design System v1.0 (Footory Dark / FM Gold Theme)

> **Extracted from**: Pencil Dev prototypes (Part 1-3 JSX) + Design System v2 screenshot
> **Last Updated**: 2026-03-02
> **Theme Name**: Footory Dark (FM Gold)
> **Aesthetic**: Football Manager analytical depth + FIFA Ultimate Team luxury gold + Dark mode

---

## 1. Design Philosophy

Footory의 디자인은 세 가지 레퍼런스에서 온다:

- **Football Manager**: 데이터 밀도, uppercase 섹션 헤더, 세그먼트 스탯 바, 포지션별 컬러 인디케이터
- **FIFA Ultimate Team**: 골드 그라디언트, 럭셔리 카드 느낌, 다크 배경 위의 빛나는 강조색
- **LinkedIn 프로필**: 섹션 기반 구조, 모듈형 빌더, "전시관" 컨셉

**핵심 원칙**:
- 다크 배경에 골드 강조 = 프리미엄 스포츠 느낌
- 데이터는 시각적으로 (숫자 나열 X, 바/뱃지/컬러로 표현)
- 영상이 주인공 (카드/썸네일이 눈에 띄어야)
- 모바일 퍼스트 (터치 타겟 최소 44px, 한 손 사용 가능)

---

## 2. Color Palette

### 2.1 Core Colors (Tailwind Config용)

```typescript
// tailwind.config.ts → theme.extend.colors
const colors = {
  // ── Background Layers (어두운 순) ──
  bg:       '#0B0E11',   // 최하단 배경 (앱 배경)
  surface:  '#12160F',   // 헤더, 네비게이션, 스티키 영역
  card:     '#1A1E16',   // 카드, 입력 필드 배경
  border:   '#2A2F22',   // 구분선, 카드 테두리

  // ── Gold Accent (브랜드 컬러) ──
  accent:      '#D4A843',   // 메인 골드
  accentLight: '#F0D078',   // 밝은 골드 (텍스트 강조)
  accentDim:   'rgba(212, 168, 67, 0.12)',  // 골드 배경 틴트

  // ── Gold Gradient (버튼, 뱃지, 하이라이트) ──
  // background: linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)

  // ── Semantic Colors ──
  green:    '#6BCB77',   // 성공, 사용 가능, 측정치 양호
  greenDim: 'rgba(107, 203, 119, 0.12)',
  orange:   '#E8943A',   // 경고, 1v1 돌파 태그
  red:      '#E85D5D',   // 에러, CF 포지션, 슈팅 태그
  redDim:   'rgba(232, 93, 93, 0.12)',
  cyan:     '#5BBFCF',   // 정보, 전진패스 태그, 링크
  cyanDim:  'rgba(91, 191, 207, 0.12)',

  // ── Position Colors (포지션별 고유 색상) ──
  posCF:  '#E85D5D',   // 센터포워드 (빨강)
  posAM:  '#E8943A',   // 공격미드/세컨스트라이커 (오렌지)
  posCM:  '#D4A843',   // 중앙미드 (골드)
  posDM:  '#6BCB77',   // 수비미드 (초록)
  posDEF: '#5B9ECF',   // 수비수 (파랑)
  posGK:  '#B088CF',   // 골키퍼 (보라)

  // ── Text Colors ──
  text:    '#F4F2EA',   // Primary text (거의 흰색, 약간 웜)
  textSec: '#A8A28A',   // Secondary text
  textDim: '#706B56',   // Dimmed text, 라벨, 캡션
}
```

### 2.2 Color Usage Rules

| 용도 | 색상 | 예시 |
|------|------|------|
| 앱 배경 | `bg` (#0B0E11) | body, 전체 배경 |
| 헤더/네비 | `surface` (#12160F) | NavHeader, BottomNav |
| 카드/입력 | `card` (#1A1E16) | 프로필 카드, 폼 필드 |
| 테두리/구분 | `border` (#2A2F22) | 카드 border, 디바이더 |
| CTA 버튼 | Gold Gradient | "다음", "저장", 주요 액션 |
| 보조 버튼 | `rgba(255,255,255,0.03)` + border | "취소", "나중에" |
| Featured 강조 | `accent` (#D4A843) border | Featured 하이라이트 테두리 |
| 링크/URL | `cyan` (#5BBFCF) | 프로필 URL, 링크 텍스트 |
| 성공 상태 | `green` (#6BCB77) | "사용 가능!", 검증 완료 |
| 위험 액션 | `red` (#E85D5D) | 삭제 버튼, 에러 |

---

## 3. Typography

### 3.1 Font Stack

```typescript
// Three font families with distinct roles
const fonts = {
  sans:    "'DM Sans', sans-serif",      // 본문, UI 텍스트, 버튼
  display: "'Sora', sans-serif",         // 제목, 이름, 숫자 강조
  mono:    "'JetBrains Mono', monospace" // 라벨, 통계 단위, URL, 코드
}
```

**Google Fonts import**:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Token | Size | Weight | Font | Usage |
|-------|------|--------|------|-------|
| `heading-xl` | 22px | 800 | Sora | 완료 화면 제목 |
| `heading-lg` | 20px | 800 | Sora | 온보딩 제목 |
| `heading-md` | 18px | 800 | Sora | 섹션 제목 |
| `heading-sm` | 16px | 800 | Sora | 카드 내 이름 |
| `body-lg` | 14px | 700 | DM Sans | 카드 제목, 중요 텍스트 |
| `body-md` | 13px | 600~800 | DM Sans | 버튼 텍스트, 본문 |
| `body-sm` | 12px | 600 | DM Sans | 보조 텍스트, 칩 |
| `caption` | 11px | 600 | DM Sans | 캡션, 작은 정보 |
| `label` | 10~11px | 700 | JetBrains Mono | FM 스타일 섹션 라벨 |
| `stat-value` | 20px | 900 | Sora | 통계 숫자 (큰) |
| `stat-unit` | 9~10px | 600 | JetBrains Mono | 단위, 타임스탬프 |
| `badge` | 9px | 800 | — | FEATURED 뱃지, 태그 |

### 3.3 FM-Style Section Header (핵심 패턴)

Football Manager의 시그니처 섹션 헤더 스타일:

```tsx
// FMSection component pattern
<div>
  <h3 style={{
    fontSize: '10px',
    fontWeight: 700,
    color: '#706B56',           // textDim
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  }}>
    SECTION TITLE
  </h3>
  <div style={{
    fontSize: '14px',
    fontWeight: 700,
    color: '#F4F2EA',           // text
    fontFamily: "'Sora', sans-serif",
    marginTop: '2px',
  }}>
    섹션 부제목
  </div>
</div>
```

**규칙**: 섹션 라벨은 항상 `UPPERCASE` + `letterSpacing: 1.5px` + `JetBrains Mono` + `textDim` 컬러.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px 기반)

```
4px   → 간격 최소 (아이콘 내부)
6px   → 칩/뱃지 내부 패딩
8px   → 요소 간 작은 간격, 칩 간격
12px  → 카드 내부 요소 간격
14px  → 칩 좌우 패딩
16px  → 카드 내 섹션 간격
20px  → 페이지 좌우 패딩 (기본)
24px  → 카드 내부 패딩 (넓은)
28px  → 섹션 간 간격
32px  → 큰 섹션 간격
```

### 4.2 Layout Constants

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | `20px` | 좌우 여백 (모든 페이지) |
| Card padding | `16px ~ 24px` | 카드 내부 여백 |
| Card gap | `12px` | 카드 내 요소 간격 |
| Section gap | `28px` | 프로필 섹션 간 간격 |
| Bottom nav height | `56px` | 하단 네비 높이 |
| Header height | `46px` | 상단 네비 높이 (12px padding 포함) |
| Safe area bottom | `env(safe-area-inset-bottom)` | iPhone notch 대응 |

### 4.3 Border Radius

```
radius:     12px  → 카드, 모달, 큰 컨테이너
radiusSm:    8px  → 입력 필드, 작은 카드, 버튼
radiusXs:    6px  → 뱃지, 작은 UI
radiusFull:  20px → 칩, 태그 (pill shape)
avatarRadius: size * 0.28 → 아바타 (squircle)
```

---

## 5. Component Specs

### 5.1 Button (Btn)

```
Primary (CTA):
  background: linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)
  color: #0B0E11 (dark text on gold)
  border: none
  borderRadius: 10px
  padding: 12px 20px
  fontSize: 13px
  fontWeight: 800
  boxShadow: 0 4px 20px rgba(212,168,67,0.25)

Secondary (Default):
  background: rgba(255,255,255,0.03)
  color: #F4F2EA (text)
  border: 1px solid #2A2F22 (border)
  borderRadius: 10px
  padding: 12px 20px

Small variant:
  padding: 8px 14px
  fontSize: 12px

Danger variant:
  background: rgba(232,93,93,0.12)
  color: #E85D5D
  border: 1px solid rgba(232,93,93,0.19)

Full width: width: 100%
```

### 5.2 Chip (Tag Pill)

```
Active:
  background: {color}18 (해당 색상 8% 투명도) or accentDim
  color: {color} or accentLight
  border: 1px solid {color}35

Inactive:
  background: rgba(255,255,255,0.03)
  color: #706B56 (textDim)
  border: 1px solid #2A2F22

Shape:
  borderRadius: 20px (pill)
  padding: 6px 14px (normal) / 4px 10px (small)
  fontSize: 12px (normal) / 10px (small)
  fontWeight: 600
```

### 5.3 Avatar (Squircle)

```
Shape: squircle (borderRadius = size * 0.28)
Background: linear-gradient(135deg, #B8922E, #D4A843)
Initial: 첫 글자, fontSize = size * 0.42, fontWeight: 900, color: #0B0E11
Badge (optional): 우측하단, size * 0.35, border: 1.5px solid accent

Size variants:
  sm: 32px
  md: 40px (default)
  lg: 48px
  xl: 120px (프로필 편집)
```

### 5.4 Card

```
background: #1A1E16 (card)
border: 1px solid #2A2F22 (border)
borderRadius: 12px
padding: 16px ~ 24px

Featured/Highlighted card:
  border: 1px solid rgba(212,168,67,0.19)  (accent 30% opacity)
```

### 5.5 Video Thumbnail

```
background: linear-gradient(135deg, #161A12, #1E221A)
borderRadius: 8px
aspectRatio: 16/9 (large) or 4/3 (small)
border: 1px solid #2A2F22 (default) or 2px solid #D4A843 (featured)

Play button overlay:
  size: 44px (large) / 32px (small)
  background: rgba(212,168,67,0.2)
  border: circle
  icon: play arrow, fill: #F0D078

Duration badge:
  position: absolute, bottom-right
  background: rgba(0,0,0,0.8)
  color: #F0D078
  fontSize: 9px
  fontFamily: JetBrains Mono
  borderRadius: 4px
  padding: 2px 6px

Featured badge:
  position: absolute, top-left
  background: linear-gradient(135deg, #B8922E, #D4A843)
  color: #0B0E11
  fontSize: 9px, fontWeight: 800
  text: "⭐ FEATURED"
```

### 5.6 StatBar (FM-Style Segmented Bar)

```
Segments: 5 bars (default)
Gap: 3px
Size sm: 14px × 6px per bar
Size md: 18px × 8px per bar
borderRadius: 2px

Active: background: {color}, boxShadow: 0 0 6px {color}35
Inactive: background: rgba(255,255,255,0.05)

Colors vary by stat type (green, accent, cyan, orange)
```

### 5.7 Position Color Bar (PosBar)

```
width: 3px
borderRadius: 2px
background: position color (see Position Colors)
boxShadow: 0 0 8px {color}40

Usage: 카드 왼쪽에 세로로 배치하여 포지션 표시
```

### 5.8 NavHeader (Top Navigation)

```
position: sticky, top: 0, zIndex: 50
background: #12160F (surface)
borderBottom: 1px solid #2A2F22
padding: 12px 20px
display: flex, align-items: center, justify-content: space-between

Left: Back arrow (22px, fill: text)
Center: Title (14px, weight: 700, Sora)
Right: Action button or 22px spacer
```

### 5.9 BottomNav (Tab Bar)

```
position: fixed, bottom: 0
left: 50%, transform: translateX(-50%)
width: 100%, max-width: 390px
background: rgba(11,14,17,0.94)    ← frosted glass effect
backdrop-filter: blur(24px)
borderTop: 1px solid #2A2F22
padding: 8px 0 env(safe-area-inset-bottom, 10px)
z-index: 100

Tab button:
  background: none (active: rgba(212,168,67,0.12))
  borderRadius: 12px
  padding: 6px 16px
  display: flex, flex-direction: column, align-items: center, gap: 2px

  Icon: 20x20 SVG
    Active: #F0D078 (accentLight)
    Inactive: #706B56 (textDim)

  Label:
    fontSize: 9px, fontWeight: 700
    letterSpacing: 0.5px
    textTransform: uppercase
    fontFamily: DM Sans
    Active: #F0D078
    Inactive: #706B56

Tabs (v1): Profile, Highlights, Tags, Team
```

### 5.10 Input Field

```
background: #12160F (surface)
border: 1px solid #2A2F22
borderRadius: 8px
color: #F4F2EA
padding: 10px 14px
fontSize: 14px
fontFamily: DM Sans

Label above:
  fontSize: 11px
  color: #706B56
  fontFamily: JetBrains Mono
  letterSpacing: 1px
  (UPPERCASE)

Numeric/Code input:
  fontFamily: JetBrains Mono
  fontWeight: 800
  textAlign: center
```

### 5.11 Progress Steps (Onboarding)

```
display: flex, gap: 3px
height: 3px per step
borderRadius: 2px

Active/Complete: linear-gradient(90deg, #B8922E, #D4A843)
Inactive: rgba(255,255,255,0.05)
```

---

## 6. Iconography

### 6.1 Icon Style
- **Source**: Inline SVG (Material Icons style)
- **Sizes**: 14px (tiny), 18px (small), 22px (medium/nav), 24px (standard)
- **Color**: Inherits from context (usually `text`, `textDim`, `accentLight`, or `accent`)
- **Stroke**: Filled style, not outlined

### 6.2 Tag Emojis (v1 Fixed)
| Tag | Emoji |
|-----|-------|
| 1v1 돌파 | ⚡ |
| 슈팅 | 🎯 |
| 헤딩경합 | 💪 |
| 퍼스트터치 | ✨ |
| 전진패스 | 🎯 |
| 1v1 수비 | 🛡️ |

---

## 7. Motion & Effects

### 7.1 Shadows
```
Gold glow (CTA): 0 4px 20px rgba(212,168,67,0.25)
StatBar glow: 0 0 6px {color}35
PosBar glow: 0 0 8px {color}40
```

### 7.2 Transitions (recommended for implementation)
```
Default: all 0.2s ease
Button hover: opacity 0.9
Page transition: slide-in from right (mobile native feel)
Modal: fade + slide-up 0.3s
```

### 7.3 Gradients
```
Gold Primary: linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)
Gold Subtle: linear-gradient(90deg, #B8922E, #D4A843)
Video Thumb BG: linear-gradient(135deg, #161A12, #1E221A)
```

---

## 8. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0E11',
        surface: '#12160F',
        card: '#1A1E16',
        border: '#2A2F22',
        accent: {
          DEFAULT: '#D4A843',
          light: '#F0D078',
          dim: 'rgba(212, 168, 67, 0.12)',
        },
        green: {
          DEFAULT: '#6BCB77',
          dim: 'rgba(107, 203, 119, 0.12)',
        },
        orange: '#E8943A',
        red: {
          DEFAULT: '#E85D5D',
          dim: 'rgba(232, 93, 93, 0.12)',
        },
        cyan: {
          DEFAULT: '#5BBFCF',
          dim: 'rgba(91, 191, 207, 0.12)',
        },
        text: {
          DEFAULT: '#F4F2EA',
          sec: '#A8A28A',
          dim: '#706B56',
        },
        pos: {
          cf: '#E85D5D',
          am: '#E8943A',
          cm: '#D4A843',
          dm: '#6BCB77',
          def: '#5B9ECF',
          gk: '#B088CF',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        sm: '8px',
        xs: '6px',
        pill: '20px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
        'gold-subtle': 'linear-gradient(90deg, #B8922E, #D4A843)',
        'video-thumb': 'linear-gradient(135deg, #161A12, #1E221A)',
      },
      boxShadow: {
        'gold-glow': '0 4px 20px rgba(212, 168, 67, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 9. Page Templates & Layout Rules

### 9.1 Page Structure
```
┌─ NavHeader (sticky) ──────────────────┐
│  ← Title                     [Action] │
├───────────────────────────────────────┤
│                                       │
│  Page Content                         │
│  padding: 20px                        │
│                                       │
│  Section 1                            │
│    FMSection Header                   │
│    Content...                         │
│    gap: 28px ↕                        │
│  Section 2                            │
│    ...                                │
│                                       │
│  (padding-bottom: 80px for BottomNav) │
│                                       │
├─ BottomNav (fixed) ───────────────────┤
│  🏠  📹  🏷️  👥                       │
└───────────────────────────────────────┘
```

### 9.2 Profile Page Section Order (LOCK-01 준수)
1. Player Card (이름, 포지션, 아바타, 핸들)
2. Featured Highlights (대표 하이라이트 1~3)
3. Measured Stats (객관 측정치 + 메달)
4. Skills by Tag (태그 포트폴리오 6개)
5. Season History (시즌 타임라인)

### 9.3 Mobile-First Rules
- 터치 타겟 최소: 44px × 44px
- 텍스트 최소 크기: 9px (뱃지/라벨만), 일반 최소 11px
- 한 줄에 칩 최대: 3~4개 (나머지는 스크롤)
- 비디오 썸네일: 항상 aspect-ratio 유지 (16:9 or 4:3)
- 스크롤 방향: 주로 세로, 가로 스크롤은 태그 칩/하이라이트 캐러셀에만

---

## 10. Do's and Don'ts

### ✅ Do
- 항상 다크 배경 위에 골드 강조색 사용
- 섹션 라벨은 UPPERCASE + JetBrains Mono + letterSpacing
- 숫자/통계는 Sora Display + 큰 사이즈 + 굵은 weight
- Featured 콘텐츠는 accent border로 시각 구분
- 포지션별 색상 일관 유지 (CF=빨강, GK=보라 등)

### ❌ Don't
- 밝은 배경 사용 금지 (다크 모드 전용)
- 순수 흰색(#FFFFFF) 사용 금지 → #F4F2EA (warm white) 사용
- 순수 검정(#000000) 배경 금지 → #0B0E11 사용
- 섹션 헤더에 sans-serif 폰트 사용 금지 → mono only
- StatBar에 6개 이상 세그먼트 금지 (max 5)
- 버튼 텍스트에 가벼운 weight 금지 (최소 700)

---

## 11. Social & Community Components (v2+ Ready)

아래 컴포넌트는 Document 2 프로토타입에서 확립된 디자인 패턴이며, v1 이후 소셜 기능 확장 시 사용.

### 11.1 HeartButton / ReactionBar

```
HeartButton (pill shape):
  background: transparent (liked: rgba(232,93,93,0.12))
  border: 1px solid #2A2F22 (liked: #E85D5D40)
  borderRadius: 20px, padding: 6px 14px
  Heart SVG: 16x16, stroke when unliked, fill when liked
  Count: 12px, JetBrains Mono, 700

ReactionBar: flex, gap: 12px
  [HeartButton] [CommentButton (same pill)] [Views (marginLeft: auto)]
  Views: eye icon 12px + count 11px mono
```

### 11.2 FeedCard (Highlight Post)

```
Structure: card bg, radius 12px, border, overflow hidden
  Header: 14px padding
    Avatar 40px + name 13px 700 + time 10px mono dim + team/tag
  Video: 16:9 aspect, VideoThumb style
    Tag overlay: top-left, colored pill ({color}20 bg, {color}35 border)
  Content: 14px padding
    Text 13px + ReactionBar
```

### 11.3 MVP Vote Card

```
Header: gold gradient bg rgba(184,146,46,0.15)
  Trophy emoji 20px + "MONTHLY MVP" 10px mono accent + title 16px display
  Subtitle: 11px mono dim (team + deadline + vote count)

Candidate row (button):
  Selected: {posColor}10 bg, {posColor}35 border
  Rank: 28x28 rounded square
    #1: gold gradient bg, dark text
    Others: surface bg, dim text
  Avatar + name 13px 700 + PosBar + pos 10px mono + stats 10px mono
  Vote bar: 60px wide, 4px height, posColor fill
  Check SVG when selected
```

### 11.4 Match Result Card

```
Header: 12px padding, "리그 3R" 10px mono accent + WIN badge (green)
Score: fontDisplay 32px 900 "3 : 1" (colon in textDim 20px)
  "FULL TIME" 10px mono dim below
Teams: centered layout
  Emoji 28px + name 12px 700 + division 10px mono dim
Player highlights: colored pills at bottom
  {posColor}12 bg + {posColor}25 border + name + action
```

### 11.5 Message List

```
FM Section header: "MESSAGES" + "💬 메시지"
Item: 14px padding, flex, gap 12px
  Avatar 44px
  Name 13px (700 if unread, 600 if read) + message preview (ellipsis)
  Time 10px mono + unread badge
  
Unread background: rgba(212,168,67,0.03)
Unread badge: 18px circle, accent bg, #0B0E11 text, 10px mono 800
Coach badge: accent on accentDim, 9px mono 700
Group badge: cyan on cyanDim, "팀" label
```

### 11.6 Notification List

```
Icon container: 36x36, borderRadius 10px
  {color}12 bg + {color}20 border + emoji 16px
Text: 12px body + 10px mono timestamp
Unread dot: 6px circle, accent, right-aligned
Recent items: rgba(212,168,67,0.03) background
```

### 11.7 Player Mini Card (Search/Discovery)

```
Avatar 48px + name 14px 700 + position pill + team 11px dim + stats
Position pill: {posColor}12 bg, {posColor}25 border, borderRadius 4px
  2px color bar + pos text 10px mono 700
Stats row: "⚽ 12G" accent + "🎬 38 clips" cyan (10px mono 600)
Trailing: chevron arrow 16px textDim
```

### 11.8 Comment Section

```
Comment item: flex, gap 10px, 12px vertical padding
  Avatar 32px + name 12px 700 + badge + time 10px mono
  Text: 12px textSec, lineHeight 1.5
  Heart button: flex column, 14px SVG + 9px count

Input row: flex, gap 10px, align center
  Avatar 28px
  Input pill: surface bg, borderRadius 20px, border, 8px 14px padding
  Send button: 32px circle, gold gradient, arrow SVG 14px
```

---

## 12. Reference: Prototype JSX Components

실제 개발 시 아래 Pencil Dev 프로토타입 파일을 참조:
- `footory-part1-onboarding.jsx` — 온보딩 5스텝, 공유 시트, 프로필 편집
- `footory-part2-content.jsx` — 하이라이트 관리, 태그 상세, 스탯 히스토리, 업로드 플로우
- `footory-part3-team.jsx` — 팀 홈, 일정, 미디어, 멤버, "내 프로필로 가져오기"
- `footory-full-app.jsx` (Document 1) — 메인 앱 전체: ProfileView, ProfileEdit, UploadFlow, TagDetail, TeamHome + TabBar
- `footory-social-components.jsx` (Document 2) — 소셜 컴포넌트: FeedCard, MVPVote, MatchCard, Leaderboard, Messages, Notifications, PlayerMiniCard, Comments

이 파일들의 인라인 스타일에서 모든 토큰이 추출되었으며, 실제 Tailwind + React 컴포넌트로 전환할 때 이 문서의 스펙을 따른다.
