import { NextRequest, NextResponse } from 'next/server'
import { getAuthedContext } from '@/lib/team/api'
import type {
  Team,
  TeamAnnouncement,
  TeamAnnouncementWithAuthor,
  TeamDetails,
  TeamEvent,
  TeamMedia,
  TeamMediaWithUploader,
  TeamMemberWithProfile,
  TeamRsvpStatus,
} from '@/types/team'

type PlayerProfile = {
  id: string
  user_id: string
  handle: string
  display_name: string
  position: string | null
  profile_image_url: string | null
  current_team_id: string | null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { supabase, user, player } = await getAuthedContext()

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  if (!player) {
    return NextResponse.json({ data: null, error: 'Player not found' }, { status: 404 })
  }

  if (player.current_team_id !== id) {
    return NextResponse.json({ data: null, error: '팀 멤버만 접근할 수 있습니다' }, { status: 403 })
  }

  const { data: teamRaw, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (teamError || !teamRaw) {
    return NextResponse.json({ data: null, error: teamError?.message ?? 'Team not found' }, { status: 404 })
  }

  const team = teamRaw as Team
  const myRole = team.created_by === user.id ? 'owner' : 'player'

  const { data: playersRaw, error: playersError } = await supabase
    .from('players')
    .select('id, user_id, handle, display_name, position, profile_image_url, current_team_id')
    .eq('current_team_id', id)
    .order('display_name', { ascending: true })

  if (playersError) {
    return NextResponse.json({ data: null, error: playersError.message }, { status: 500 })
  }

  const players = (playersRaw ?? []) as PlayerProfile[]
  const playersByUserId = new Map<string, PlayerProfile>()

  for (const profile of players) {
    playersByUserId.set(profile.user_id, profile)
  }

  const members: TeamMemberWithProfile[] = players.map((profile) => ({
    team_id: id,
    user_id: profile.user_id,
    role: profile.user_id === user.id ? myRole : 'player',
    joined_at: team.created_at,
    player: {
      id: profile.id,
      handle: profile.handle,
      display_name: profile.display_name,
      position: profile.position,
      profile_image_url: profile.profile_image_url,
    },
  }))

  const [announcementsRes, eventsRes, mediaRes] = await Promise.all([
    supabase
      .from('team_announcements')
      .select('*')
      .eq('team_id', id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('team_events')
      .select('*')
      .eq('team_id', id)
      .order('start_at', { ascending: true }),
    supabase
      .from('team_media')
      .select('*')
      .eq('team_id', id)
      .order('created_at', { ascending: false }),
  ])

  const announcements = announcementsRes.error
    ? []
    : (announcementsRes.data ?? []) as TeamAnnouncement[]
  const events = eventsRes.error
    ? []
    : (eventsRes.data ?? []) as TeamEvent[]
  const media = mediaRes.error
    ? []
    : (mediaRes.data ?? []) as TeamMedia[]

  const announcementsWithAuthor: TeamAnnouncementWithAuthor[] = announcements.map((item) => ({
    ...item,
    author_name: playersByUserId.get(item.author_id)?.display_name ?? null,
  }))

  const mediaWithUploader: TeamMediaWithUploader[] = media.map((item) => ({
    ...item,
    uploader_name: playersByUserId.get(item.uploaded_by)?.display_name ?? null,
  }))

  const eventIds = events.map((event) => event.id)
  let myRsvps: Record<string, TeamRsvpStatus> = {}

  if (eventIds.length > 0) {
    const { data: rsvps, error: rsvpError } = await supabase
      .from('team_event_rsvps')
      .select('event_id, status')
      .eq('user_id', user.id)
      .in('event_id', eventIds)

    if (!rsvpError) {
      myRsvps = Object.fromEntries(
        (rsvps ?? []).map((rsvp) => [rsvp.event_id, rsvp.status as TeamRsvpStatus])
      )
    }
  }

  const data: TeamDetails = {
    team,
    members,
    announcements: announcementsWithAuthor,
    events,
    media: mediaWithUploader,
    myRole,
    myRsvps,
  }

  return NextResponse.json({ data, error: null })
}
