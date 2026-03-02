'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Player } from '@/types/profile'

export function useProfile() {
  const [profile, setProfile] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProfile(data as unknown as Player)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, isLoading, error, refetch: fetchProfile }
}

export function usePublicProfile(handle: string) {
  const [profile, setProfile] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')
          .eq('handle', handle)
          .single()
        if (fetchError) setError(fetchError.message)
        else setProfile(data as unknown as Player)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [handle])

  return { profile, isLoading, error }
}
