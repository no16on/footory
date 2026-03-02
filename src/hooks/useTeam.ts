'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  Team,
  TeamDetails,
  TeamEventType,
  TeamRsvpStatus,
} from '@/types/team'

type TeamContext = {
  teamId: string | null
}

type CreateTeamInput = {
  name: string
  description?: string
  region?: string
}

type CreateAnnouncementInput = {
  title: string
  body?: string
  isPinned?: boolean
}

type CreateEventInput = {
  title: string
  eventType: TeamEventType
  startAt: string
  endAt?: string
  location?: string
  description?: string
}

type UploadTeamMediaInput = {
  mediaType: 'photo' | 'video'
  r2Key: string
  caption?: string
  thumbnailUrl?: string
}

export function useTeam() {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [details, setDetails] = useState<TeamDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const meRes = await fetch('/api/teams/me')
      const meJson = (await meRes.json()) as { data: TeamContext | null; error: string | null }

      if (meJson.error) {
        setError(meJson.error)
        setTeamId(null)
        setTeam(null)
        setDetails(null)
        return
      }

      const nextTeamId = meJson.data?.teamId ?? null
      setTeamId(nextTeamId)

      if (!nextTeamId) {
        setTeam(null)
        setDetails(null)
        return
      }

      const detailRes = await fetch(`/api/teams/${nextTeamId}`)
      const detailJson = (await detailRes.json()) as { data: TeamDetails | null; error: string | null }

      if (detailJson.error) {
        setError(detailJson.error)
        setTeam(null)
        setDetails(null)
        return
      }

      setTeam(detailJson.data?.team ?? null)
      setDetails(detailJson.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  async function createTeam(input: CreateTeamInput) {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const json = (await res.json()) as { data: Team | null; error: string | null }

    if (!json.error) {
      await fetchTeam()
    }

    return json
  }

  async function joinTeam(inviteCode: string) {
    const res = await fetch('/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    })

    const json = (await res.json()) as { data: Team | null; error: string | null }

    if (!json.error) {
      await fetchTeam()
    }

    return json
  }

  async function createAnnouncement(input: CreateAnnouncementInput) {
    if (!teamId) {
      return { data: null, error: 'Team not found' }
    }

    const res = await fetch(`/api/teams/${teamId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const json = await res.json()

    if (!json.error) {
      await fetchTeam()
    }

    return json as { data: unknown; error: string | null }
  }

  async function createEvent(input: CreateEventInput) {
    if (!teamId) {
      return { data: null, error: 'Team not found' }
    }

    const res = await fetch(`/api/teams/${teamId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const json = await res.json()

    if (!json.error) {
      await fetchTeam()
    }

    return json as { data: unknown; error: string | null }
  }

  async function rsvpEvent(eventId: string, status: TeamRsvpStatus) {
    if (!teamId) {
      return { data: null, error: 'Team not found' }
    }

    const res = await fetch(`/api/teams/${teamId}/events/${eventId}/rsvp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const json = await res.json()

    if (!json.error) {
      await fetchTeam()
    }

    return json as { data: unknown; error: string | null }
  }

  async function uploadMedia(input: UploadTeamMediaInput) {
    if (!teamId) {
      return { data: null, error: 'Team not found' }
    }

    const res = await fetch(`/api/teams/${teamId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    const json = await res.json()

    if (!json.error) {
      await fetchTeam()
    }

    return json as { data: unknown; error: string | null }
  }

  async function claimMedia(mediaId: string) {
    if (!teamId) {
      return { data: null, error: 'Team not found' }
    }

    const res = await fetch(`/api/teams/${teamId}/media/${mediaId}/claim`, {
      method: 'POST',
    })

    const json = await res.json()

    return json as { data: unknown; error: string | null }
  }

  return {
    teamId,
    team,
    details,
    isLoading,
    error,
    refetch: fetchTeam,
    createTeam,
    joinTeam,
    createAnnouncement,
    createEvent,
    rsvpEvent,
    uploadMedia,
    claimMedia,
  }
}
