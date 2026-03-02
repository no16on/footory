import type { Database } from './database'

export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type TeamAnnouncement = Database['public']['Tables']['team_announcements']['Row']
export type TeamEvent = Database['public']['Tables']['team_events']['Row']
export type TeamEventRsvp = Database['public']['Tables']['team_event_rsvps']['Row']
export type TeamMedia = Database['public']['Tables']['team_media']['Row']

export type TeamRole = 'owner' | 'coach' | 'manager' | 'player'
export type TeamEventType = 'training' | 'match' | 'other'
export type TeamRsvpStatus = 'going' | 'maybe' | 'no'

export type TeamMemberWithProfile = TeamMember & {
  player: {
    id: string
    handle: string
    display_name: string
    position: string | null
    profile_image_url: string | null
  } | null
}

export type TeamAnnouncementWithAuthor = TeamAnnouncement & {
  author_name: string | null
}

export type TeamMediaWithUploader = TeamMedia & {
  uploader_name: string | null
}

export type TeamDetails = {
  team: Team
  members: TeamMemberWithProfile[]
  announcements: TeamAnnouncementWithAuthor[]
  events: TeamEvent[]
  media: TeamMediaWithUploader[]
  myRole: TeamRole
  myRsvps: Record<string, TeamRsvpStatus>
}

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  owner: '오너',
  coach: '코치',
  manager: '매니저',
  player: '선수',
}

export const TEAM_EVENT_TYPE_LABEL: Record<TeamEventType, string> = {
  training: '훈련',
  match: '경기',
  other: '기타',
}

export const TEAM_EVENT_TYPE_COLOR: Record<TeamEventType, string> = {
  training: '#6BCB77',
  match: '#E8943A',
  other: '#5BBFCF',
}

export const TEAM_RSVP_LABEL: Record<TeamRsvpStatus, string> = {
  going: '참석',
  maybe: '미정',
  no: '불참',
}

export function canManageTeam(role: TeamRole | null | undefined) {
  return role === 'owner' || role === 'coach' || role === 'manager'
}
