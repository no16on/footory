'use client'

import { useMemo, useState } from 'react'
import { NavHeader } from '@/components/ui/nav-header'
import { useTeam } from '@/hooks/useTeam'
import {
  canManageTeam,
  TEAM_EVENT_TYPE_COLOR,
  TEAM_EVENT_TYPE_LABEL,
  TEAM_ROLE_LABEL,
  TEAM_RSVP_LABEL,
  type TeamEventType,
  type TeamMediaWithUploader,
  type TeamRsvpStatus,
} from '@/types/team'

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day} ${hour}:${minute}`
}

function toIsoFromLocal(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: '#706B56',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          color: '#F4F2EA',
        }}
      >
        {title}
      </p>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: '#1A1E16',
        border: `1px solid ${color}30`,
        borderRadius: '10px',
        padding: '10px 12px',
      }}
    >
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          color: '#706B56',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '5px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '20px',
          fontWeight: 900,
          color,
        }}
      >
        {value}
      </p>
    </div>
  )
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label
      style={{
        display: 'block',
        marginBottom: '5px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#706B56',
      }}
    >
      {children}
    </label>
  )
}

function inputStyle() {
  return {
    width: '100%',
    border: '1px solid #2A2F22',
    background: '#12160F',
    color: '#F4F2EA',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
  } as const
}

function buttonStyle(primary: boolean) {
  if (primary) {
    return {
      border: 'none',
      background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
      color: '#0B0E11',
      borderRadius: '10px',
      padding: '11px 14px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '13px',
      fontWeight: 800,
      cursor: 'pointer',
    } as const
  }

  return {
    border: '1px solid #2A2F22',
    background: 'rgba(255,255,255,0.03)',
    color: '#F4F2EA',
    borderRadius: '10px',
    padding: '11px 14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function TeamMediaCard({
  media,
  onClaim,
  claimingId,
}: {
  media: TeamMediaWithUploader
  onClaim: (id: string) => void
  claimingId: string | null
}) {
  const isVideo = media.media_type === 'video'

  return (
    <div
      style={{
        background: '#1A1E16',
        border: '1px solid #2A2F22',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          background: 'linear-gradient(135deg, #161A12, #1E221A)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.thumbnail_url || media.media_url}
          alt={media.caption || '팀 미디어'}
          width={160}
          height={120}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <span
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            padding: '3px 7px',
            borderRadius: '20px',
            background: isVideo ? 'rgba(212,168,67,0.22)' : 'rgba(91,191,207,0.2)',
            border: `1px solid ${isVideo ? 'rgba(212,168,67,0.38)' : 'rgba(91,191,207,0.35)'}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: isVideo ? '#F0D078' : '#5BBFCF',
          }}
        >
          {isVideo ? 'VIDEO' : 'PHOTO'}
        </span>
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: '#F4F2EA',
            minHeight: '32px',
            lineHeight: 1.35,
          }}
        >
          {media.caption || '캡션 없음'}
        </p>

        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: '#706B56',
          }}
        >
          {media.uploader_name ?? 'Unknown'} · {formatDateTime(media.created_at)}
        </p>

        {isVideo && (
          <button
            onClick={() => onClaim(media.id)}
            disabled={claimingId === media.id}
            style={{
              ...buttonStyle(false),
              width: '100%',
              padding: '8px 10px',
              fontSize: '12px',
              opacity: claimingId === media.id ? 0.7 : 1,
            }}
          >
            {claimingId === media.id ? '가져오는 중…' : '내 프로필로 가져오기'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function TeamPage() {
  const {
    details,
    isLoading,
    error,
    createTeam,
    joinTeam,
    createAnnouncement,
    createEvent,
    uploadMedia,
    rsvpEvent,
    claimMedia,
  } = useTeam()

  const [notice, setNotice] = useState<string | null>(null)

  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createRegion, setCreateRegion] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')

  const [eventTitle, setEventTitle] = useState('')
  const [eventType, setEventType] = useState<TeamEventType>('training')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [eventLocation, setEventLocation] = useState('')

  const [mediaCaption, setMediaCaption] = useState('')
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const isStaff = canManageTeam(details?.myRole)

  const stats = useMemo(() => {
    if (!details) {
      return { members: 0, announcements: 0, events: 0, media: 0 }
    }

    return {
      members: details.members.length,
      announcements: details.announcements.length,
      events: details.events.length,
      media: details.media.length,
    }
  }, [details])

  async function handleCreateTeam() {
    const result = await createTeam({
      name: createName,
      description: createDescription,
      region: createRegion,
    })

    if (result.error) {
      setNotice(result.error)
      return
    }

    setCreateName('')
    setCreateDescription('')
    setCreateRegion('')
    setNotice('팀을 생성했습니다')
  }

  async function handleJoinTeam() {
    const result = await joinTeam(joinCode)

    if (result.error) {
      setNotice(result.error)
      return
    }

    setJoinCode('')
    setNotice('팀에 합류했습니다')
  }

  async function handleCreateAnnouncement() {
    const result = await createAnnouncement({
      title: announcementTitle,
      body: announcementBody,
    })

    if (result.error) {
      setNotice(result.error)
      return
    }

    setAnnouncementTitle('')
    setAnnouncementBody('')
    setNotice('공지를 등록했습니다')
  }

  async function handleCreateEvent() {
    const isoStart = toIsoFromLocal(eventStart)

    if (!isoStart) {
      setNotice('시작 시간을 확인해 주세요')
      return
    }

    const isoEnd = eventEnd ? toIsoFromLocal(eventEnd) : null

    if (eventEnd && !isoEnd) {
      setNotice('종료 시간을 확인해 주세요')
      return
    }

    const result = await createEvent({
      title: eventTitle,
      eventType,
      startAt: isoStart,
      endAt: isoEnd ?? undefined,
      location: eventLocation,
    })

    if (result.error) {
      setNotice(result.error)
      return
    }

    setEventTitle('')
    setEventStart('')
    setEventEnd('')
    setEventLocation('')
    setNotice('일정을 등록했습니다')
  }

  async function handleRsvp(eventId: string, status: TeamRsvpStatus) {
    const result = await rsvpEvent(eventId, status)

    if (result.error) {
      setNotice(result.error)
      return
    }

    setNotice('응답이 저장되었습니다')
  }

  async function handleUploadTeamMedia(file: File) {
    setIsUploadingMedia(true)

    try {
      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo'

      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      const presignJson = await presignRes.json()

      if (presignJson.error) {
        setNotice(presignJson.error)
        return
      }

      const { presignedUrl, key } = presignJson as { presignedUrl: string; key: string }

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        setNotice('파일 업로드에 실패했습니다')
        return
      }

      const result = await uploadMedia({
        mediaType,
        r2Key: key,
        caption: mediaCaption,
      })

      if (result.error) {
        setNotice(result.error)
        return
      }

      setMediaCaption('')
      setNotice('팀 미디어를 업로드했습니다')
    } finally {
      setIsUploadingMedia(false)
    }
  }

  async function handleClaimMedia(mediaId: string) {
    setClaimingId(mediaId)

    try {
      const result = await claimMedia(mediaId)

      if (result.error) {
        setNotice(result.error)
        return
      }

      setNotice('프로필 영상 라이브러리로 가져왔습니다')
    } finally {
      setClaimingId(null)
    }
  }

  function handleCopyInviteCode() {
    if (!details?.team.invite_code) {
      return
    }

    navigator.clipboard.writeText(details.team.invite_code)
    setNotice('초대 코드가 복사되었습니다')
  }

  if (isLoading) {
    return (
      <>
        <NavHeader title="팀 허브" />
        <div
          style={{
            padding: '40px 20px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '1px',
            color: '#706B56',
            textAlign: 'center',
          }}
        >
          LOADING TEAM HUB…
        </div>
      </>
    )
  }

  return (
    <>
      <NavHeader title="팀 허브" />

      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {notice && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(212,168,67,0.2)',
              background: 'rgba(212,168,67,0.08)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: '#F0D078',
            }}
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(232,93,93,0.24)',
              background: 'rgba(232,93,93,0.1)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: '#E85D5D',
            }}
          >
            {error}
          </div>
        )}

        {!details && (
          <>
            <div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: '#706B56',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                TEAM HUB
              </p>
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#F4F2EA',
                }}
              >
                팀을 만들거나 합류하세요
              </h2>
            </div>

            <div
              style={{
                background: '#1A1E16',
                border: '1px solid #2A2F22',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <SectionHeader label="CREATE" title="새 팀 만들기" />

              <div>
                <FieldLabel>팀 이름</FieldLabel>
                <input value={createName} onChange={(event) => setCreateName(event.target.value)} style={inputStyle()} />
              </div>

              <div>
                <FieldLabel>지역</FieldLabel>
                <input value={createRegion} onChange={(event) => setCreateRegion(event.target.value)} style={inputStyle()} />
              </div>

              <div>
                <FieldLabel>소개</FieldLabel>
                <textarea
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                  style={{ ...inputStyle(), minHeight: '72px', resize: 'vertical' }}
                />
              </div>

              <button onClick={handleCreateTeam} style={buttonStyle(true)}>
                팀 생성하기
              </button>
            </div>

            <div
              style={{
                background: '#1A1E16',
                border: '1px solid #2A2F22',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <SectionHeader label="JOIN" title="초대 코드로 합류" />

              <div>
                <FieldLabel>Invite Code</FieldLabel>
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  style={{ ...inputStyle(), fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px' }}
                  placeholder="예: A1B2C3D4"
                />
              </div>

              <button onClick={handleJoinTeam} style={buttonStyle(false)}>
                팀 합류하기
              </button>
            </div>
          </>
        )}

        {details && (
          <>
            <div
              style={{
                background: '#1A1E16',
                border: '1px solid rgba(212,168,67,0.25)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '1.5px', color: '#706B56', textTransform: 'uppercase' }}>
                    TEAM
                  </p>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 800, color: '#F4F2EA', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {details.team.name}
                  </h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#A8A28A', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {details.team.region || '지역 미정'} · {details.team.season_year} 시즌
                  </p>
                </div>

                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '20px',
                    border: '1px solid rgba(212,168,67,0.3)',
                    background: 'rgba(212,168,67,0.12)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px',
                    color: '#F0D078',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  {TEAM_ROLE_LABEL[details.myRole]}
                </div>
              </div>

              <p style={{ marginTop: '10px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#F4F2EA', lineHeight: 1.45 }}>
                {details.team.description || '팀 소개가 아직 없습니다'}
              </p>

              <button
                onClick={handleCopyInviteCode}
                style={{
                  ...buttonStyle(false),
                  marginTop: '12px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                }}
              >
                <span>INVITE CODE</span>
                <span style={{ color: '#F0D078' }}>{details.team.invite_code || 'N/A'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              <StatCard label="MEMBERS" value={String(stats.members)} color="#D4A843" />
              <StatCard label="POSTS" value={String(stats.announcements)} color="#6BCB77" />
              <StatCard label="EVENTS" value={String(stats.events)} color="#E8943A" />
              <StatCard label="MEDIA" value={String(stats.media)} color="#5BBFCF" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SectionHeader label="ANNOUNCEMENTS" title="팀 공지" />

              {isStaff && (
                <div style={{ background: '#1A1E16', border: '1px solid #2A2F22', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    value={announcementTitle}
                    onChange={(event) => setAnnouncementTitle(event.target.value)}
                    style={inputStyle()}
                    placeholder="공지 제목"
                  />
                  <textarea
                    value={announcementBody}
                    onChange={(event) => setAnnouncementBody(event.target.value)}
                    style={{ ...inputStyle(), minHeight: '64px', resize: 'vertical' }}
                    placeholder="공지 내용"
                  />
                  <button onClick={handleCreateAnnouncement} style={buttonStyle(true)}>
                    공지 등록
                  </button>
                </div>
              )}

              {details.announcements.length === 0 && (
                <div style={{ padding: '16px', border: '1px dashed #2A2F22', borderRadius: '10px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#706B56' }}>
                  등록된 공지가 없습니다
                </div>
              )}

              {details.announcements.map((item) => (
                <div key={item.id} style={{ background: '#1A1E16', border: `1px solid ${item.is_pinned ? 'rgba(212,168,67,0.28)' : '#2A2F22'}`, borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F4F2EA', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    {item.is_pinned && (
                      <span style={{ padding: '3px 7px', borderRadius: '20px', background: 'rgba(212,168,67,0.18)', border: '1px solid rgba(212,168,67,0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#F0D078', flexShrink: 0 }}>
                        PINNED
                      </span>
                    )}
                  </div>
                  <p style={{ marginTop: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#A8A28A', lineHeight: 1.45 }}>
                    {item.body || '내용 없음'}
                  </p>
                  <p style={{ marginTop: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#706B56' }}>
                    {item.author_name ?? 'Unknown'} · {formatDateTime(item.created_at)}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SectionHeader label="CALENDAR" title="훈련·경기 일정" />

              {isStaff && (
                <div style={{ background: '#1A1E16', border: '1px solid #2A2F22', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} style={inputStyle()} placeholder="일정 제목" />

                  <select
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value as TeamEventType)}
                    style={inputStyle()}
                  >
                    <option value="training">훈련</option>
                    <option value="match">경기</option>
                    <option value="other">기타</option>
                  </select>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="datetime-local" value={eventStart} onChange={(event) => setEventStart(event.target.value)} style={inputStyle()} />
                    <input type="datetime-local" value={eventEnd} onChange={(event) => setEventEnd(event.target.value)} style={inputStyle()} />
                  </div>

                  <input value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} style={inputStyle()} placeholder="장소" />

                  <button onClick={handleCreateEvent} style={buttonStyle(true)}>
                    일정 등록
                  </button>
                </div>
              )}

              {details.events.length === 0 && (
                <div style={{ padding: '16px', border: '1px dashed #2A2F22', borderRadius: '10px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#706B56' }}>
                  예정된 일정이 없습니다
                </div>
              )}

              {details.events.map((event) => {
                const type = (event.event_type as TeamEventType) || 'other'
                const color = TEAM_EVENT_TYPE_COLOR[type] ?? '#5BBFCF'
                const myStatus = details.myRsvps[event.id] || null

                return (
                  <div key={event.id} style={{ background: '#1A1E16', border: `1px solid ${color}30`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F4F2EA', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                      <span style={{ padding: '3px 7px', borderRadius: '20px', border: `1px solid ${color}55`, background: `${color}22`, color, fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', flexShrink: 0 }}>
                        {TEAM_EVENT_TYPE_LABEL[type]}
                      </span>
                    </div>

                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#A8A28A', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                      {formatDateTime(event.start_at)}
                      {event.end_at ? <><br /><span style={{ color: '#706B56' }}>~</span> {formatDateTime(event.end_at)}</> : ''}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#706B56' }}>{event.location || '장소 미정'}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px' }}>
                      {(['going', 'maybe', 'no'] as TeamRsvpStatus[]).map((status) => {
                        const active = myStatus === status

                        return (
                          <button
                            key={status}
                            onClick={() => handleRsvp(event.id, status)}
                            style={{
                              border: `1px solid ${active ? color + '66' : '#2A2F22'}`,
                              background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
                              color: active ? color : '#A8A28A',
                              borderRadius: '8px',
                              padding: '7px 8px',
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            {TEAM_RSVP_LABEL[status]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SectionHeader label="MEDIA" title="팀 미디어" />

              <div style={{ background: '#1A1E16', border: '1px solid #2A2F22', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={mediaCaption}
                  onChange={(event) => setMediaCaption(event.target.value)}
                  style={{ ...inputStyle(), minHeight: '52px', resize: 'vertical' }}
                  placeholder="업로드 캡션"
                />

                <label style={{ ...buttonStyle(false), textAlign: 'center' }}>
                  {isUploadingMedia ? '업로드 중…' : '파일 선택 후 업로드'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    disabled={isUploadingMedia}
                    onChange={(event) => {
                      const file = event.target.files?.[0]

                      if (!file) {
                        return
                      }

                      handleUploadTeamMedia(file)
                      event.target.value = ''
                    }}
                  />
                </label>
              </div>

              {details.media.length === 0 && (
                <div style={{ padding: '16px', border: '1px dashed #2A2F22', borderRadius: '10px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#706B56' }}>
                  업로드된 미디어가 없습니다
                </div>
              )}

              {details.media.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {details.media.map((item) => (
                    <TeamMediaCard key={item.id} media={item} onClaim={handleClaimMedia} claimingId={claimingId} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SectionHeader label="MEMBERS" title="팀 멤버" />

              <div style={{ background: '#1A1E16', border: '1px solid #2A2F22', borderRadius: '10px', overflow: 'hidden' }}>
                {details.members.map((member, index) => {
                  const initial = member.player?.display_name?.[0] || 'U'
                  const role = (member.role in TEAM_ROLE_LABEL ? member.role : 'player') as keyof typeof TEAM_ROLE_LABEL

                  return (
                    <div
                      key={`${member.team_id}-${member.user_id}`}
                      style={{
                        padding: '11px 12px',
                        borderBottom: index < details.members.length - 1 ? '1px solid #2A2F22' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '11px',
                          background: 'linear-gradient(135deg, #B8922E, #D4A843)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: 900,
                          color: '#0B0E11',
                          fontSize: '16px',
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#F4F2EA', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.player?.display_name || member.user_id.slice(0, 8)}
                        </p>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#706B56', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.player?.position || 'POS 미정'} · {member.player?.handle ? `@${member.player.handle}` : '핸들 미등록'}
                        </p>
                      </div>

                      <span style={{ padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(212,168,67,0.32)', background: 'rgba(212,168,67,0.12)', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#F0D078' }}>
                        {TEAM_ROLE_LABEL[role]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
