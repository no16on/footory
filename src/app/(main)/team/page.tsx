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
  if (Number.isNaN(date.getTime())) return '-'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

function formatDateShort(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

function toIsoFromLocal(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase mb-0.5">{label}</p>
      <p className="font-display text-sm font-bold text-text">{title}</p>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="bg-card rounded-xl p-3"
      style={{ border: `1px solid ${color}30` }}
    >
      <p className="font-mono text-[9px] text-text-dim tracking-wider uppercase mb-1.5">{label}</p>
      <p className="font-display text-xl font-black" style={{ color }}>{value}</p>
    </div>
  )
}

const inputCls = 'w-full border border-border bg-surface text-text rounded-lg px-3 py-2.5 text-[13px] font-sans placeholder:text-text-dim/60'

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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative aspect-[4/3]" style={{ background: 'var(--bg-video-thumb)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.thumbnail_url || media.media_url}
          alt={media.caption || '팀 미디어'}
          width={160}
          height={120}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full font-mono text-[9px]"
          style={{
            background: isVideo ? 'rgba(212,168,67,0.22)' : 'rgba(91,191,207,0.2)',
            border: `1px solid ${isVideo ? 'rgba(212,168,67,0.38)' : 'rgba(91,191,207,0.35)'}`,
            color: isVideo ? '#F0D078' : '#5BBFCF',
          }}
        >
          {isVideo ? 'VIDEO' : 'PHOTO'}
        </span>
      </div>
      <div className="p-2.5 flex flex-col gap-2">
        <p className="font-sans text-xs text-text leading-snug min-h-[28px]">
          {media.caption || '캡션 없음'}
        </p>
        <p className="font-mono text-[9px] text-text-dim">
          {media.uploader_name ?? 'Unknown'} · {formatDateShort(media.created_at)}
        </p>
        {isVideo && (
          <button
            onClick={() => onClaim(media.id)}
            disabled={claimingId === media.id}
            className="w-full py-2 px-2.5 text-xs font-sans font-bold rounded-lg border border-border bg-white/[0.03] text-text cursor-pointer disabled:opacity-60"
          >
            {claimingId === media.id ? '가져오는 중…' : '내 프로필로 가져오기'}
          </button>
        )}
      </div>
    </div>
  )
}

function TeamSkeleton() {
  return (
    <div className="px-5 pt-4 flex flex-col gap-4">
      <div className="skeleton h-[140px] rounded-2xl" />
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-[72px] rounded-xl" />
        <div className="skeleton h-[72px] rounded-xl" />
        <div className="skeleton h-[72px] rounded-xl" />
        <div className="skeleton h-[72px] rounded-xl" />
      </div>
      <div className="skeleton h-[100px] rounded-xl" />
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
    if (!details) return { members: 0, announcements: 0, events: 0, media: 0 }
    return {
      members: details.members.length,
      announcements: details.announcements.length,
      events: details.events.length,
      media: details.media.length,
    }
  }, [details])

  async function handleCreateTeam() {
    const result = await createTeam({ name: createName, description: createDescription, region: createRegion })
    if (result.error) { setNotice(result.error); return }
    setCreateName(''); setCreateDescription(''); setCreateRegion('')
    setNotice('팀을 생성했습니다')
  }

  async function handleJoinTeam() {
    const result = await joinTeam(joinCode)
    if (result.error) { setNotice(result.error); return }
    setJoinCode('')
    setNotice('팀에 합류했습니다')
  }

  async function handleCreateAnnouncement() {
    const result = await createAnnouncement({ title: announcementTitle, body: announcementBody })
    if (result.error) { setNotice(result.error); return }
    setAnnouncementTitle(''); setAnnouncementBody('')
    setNotice('공지를 등록했습니다')
  }

  async function handleCreateEvent() {
    const isoStart = toIsoFromLocal(eventStart)
    if (!isoStart) { setNotice('시작 시간을 확인해 주세요'); return }
    const isoEnd = eventEnd ? toIsoFromLocal(eventEnd) : null
    if (eventEnd && !isoEnd) { setNotice('종료 시간을 확인해 주세요'); return }
    const result = await createEvent({
      title: eventTitle, eventType, startAt: isoStart, endAt: isoEnd ?? undefined, location: eventLocation,
    })
    if (result.error) { setNotice(result.error); return }
    setEventTitle(''); setEventStart(''); setEventEnd(''); setEventLocation('')
    setNotice('일정을 등록했습니다')
  }

  async function handleRsvp(eventId: string, status: TeamRsvpStatus) {
    const result = await rsvpEvent(eventId, status)
    if (result.error) { setNotice(result.error); return }
    setNotice('응답이 저장되었습니다')
  }

  async function handleUploadTeamMedia(file: File) {
    setIsUploadingMedia(true)
    try {
      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo'
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
      })
      const presignJson = await presignRes.json()
      if (presignJson.error) { setNotice(presignJson.error); return }
      const { presignedUrl, key } = presignJson as { presignedUrl: string; key: string }
      const uploadRes = await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!uploadRes.ok) { setNotice('파일 업로드에 실패했습니다'); return }
      const result = await uploadMedia({ mediaType, r2Key: key, caption: mediaCaption })
      if (result.error) { setNotice(result.error); return }
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
      if (result.error) { setNotice(result.error); return }
      setNotice('프로필 영상 라이브러리로 가져왔습니다')
    } finally {
      setClaimingId(null)
    }
  }

  function handleCopyInviteCode() {
    if (!details?.team.invite_code) return
    navigator.clipboard.writeText(details.team.invite_code)
    setNotice('초대 코드가 복사되었습니다')
  }

  if (isLoading) {
    return (
      <>
        <NavHeader title="팀 허브" />
        <TeamSkeleton />
      </>
    )
  }

  return (
    <>
      <NavHeader title="팀 허브" />

      <div className="px-5 pt-4 pb-28 flex flex-col gap-5">
        {notice && (
          <div className="px-3 py-2.5 rounded-lg border border-accent/20 bg-accent/[0.08] font-sans text-xs text-accent-light animate-fade-in">
            {notice}
          </div>
        )}

        {error && (
          <div className="px-3 py-2.5 rounded-lg border border-red/25 bg-red/10 font-sans text-xs text-red animate-fade-in">
            {error}
          </div>
        )}

        {!details && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <p className="font-mono text-[10px] text-text-dim tracking-[1.5px] uppercase mb-0.5">TEAM HUB</p>
              <h2 className="font-display text-xl font-extrabold text-text">팀을 만들거나 합류하세요</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
              <SectionHeader label="CREATE" title="새 팀 만들기" />
              <input value={createName} onChange={(e) => setCreateName(e.target.value)} className={inputCls} placeholder="팀 이름" />
              <input value={createRegion} onChange={(e) => setCreateRegion(e.target.value)} className={inputCls} placeholder="지역" />
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                className={`${inputCls} min-h-[72px] resize-y`}
                placeholder="소개"
              />
              <button onClick={handleCreateTeam} className="w-full py-3 border-none rounded-xl font-sans text-[13px] font-extrabold text-bg cursor-pointer" style={{ background: 'var(--bg-gold-gradient)' }}>
                팀 생성하기
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
              <SectionHeader label="JOIN" title="초대 코드로 합류" />
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className={`${inputCls} font-mono tracking-wider`}
                placeholder="예: A1B2C3D4"
              />
              <button onClick={handleJoinTeam} className="w-full py-3 border border-border rounded-xl bg-white/[0.03] font-sans text-[13px] font-bold text-text cursor-pointer">
                팀 합류하기
              </button>
            </div>
          </div>
        )}

        {details && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Team Card */}
            <div className="bg-card border border-accent/25 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[1.5px] text-text-dim uppercase">TEAM</p>
                  <h2 className="font-display text-xl font-extrabold text-text mt-0.5 truncate">{details.team.name}</h2>
                  <p className="font-sans text-xs text-text-sec mt-1 truncate">
                    {details.team.region || '지역 미정'} · {details.team.season_year} 시즌
                  </p>
                </div>
                <div className="shrink-0 px-2 py-1 rounded-full border border-accent/30 bg-accent-dim font-mono text-[10px] text-accent-light uppercase">
                  {TEAM_ROLE_LABEL[details.myRole]}
                </div>
              </div>
              <p className="mt-2.5 font-sans text-[13px] text-text leading-relaxed">
                {details.team.description || '팀 소개가 아직 없습니다'}
              </p>
              <button
                onClick={handleCopyInviteCode}
                className="mt-3 w-full flex items-center justify-between py-2.5 px-3 border border-border rounded-xl bg-white/[0.03] font-mono text-[11px] text-text cursor-pointer"
              >
                <span>INVITE CODE</span>
                <span className="text-accent-light">{details.team.invite_code || 'N/A'}</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="MEMBERS" value={String(stats.members)} color="#D4A843" />
              <StatCard label="POSTS" value={String(stats.announcements)} color="#6BCB77" />
              <StatCard label="EVENTS" value={String(stats.events)} color="#E8943A" />
              <StatCard label="MEDIA" value={String(stats.media)} color="#5BBFCF" />
            </div>

            {/* Announcements */}
            <div className="flex flex-col gap-2.5">
              <SectionHeader label="ANNOUNCEMENTS" title="팀 공지" />

              {isStaff && (
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2">
                  <input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} className={inputCls} placeholder="공지 제목" />
                  <textarea value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} className={`${inputCls} min-h-[56px] resize-y`} placeholder="공지 내용" />
                  <button onClick={handleCreateAnnouncement} className="w-full py-2.5 border-none rounded-xl font-sans text-[13px] font-extrabold text-bg cursor-pointer" style={{ background: 'var(--bg-gold-gradient)' }}>
                    공지 등록
                  </button>
                </div>
              )}

              {details.announcements.length === 0 && (
                <div className="py-4 border border-dashed border-border rounded-xl text-center font-sans text-xs text-text-dim">
                  등록된 공지가 없습니다
                </div>
              )}

              {details.announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-3"
                  style={{ border: `1px solid ${item.is_pinned ? 'rgba(212,168,67,0.28)' : '#2A2F22'}` }}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-sm font-bold text-text flex-1 min-w-0 truncate">{item.title}</p>
                    {item.is_pinned && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent/[0.18] border border-accent/35 font-mono text-[9px] text-accent-light">PINNED</span>
                    )}
                  </div>
                  <p className="mt-1.5 font-sans text-[13px] text-text-sec leading-relaxed">{item.body || '내용 없음'}</p>
                  <p className="mt-2 font-mono text-[9px] text-text-dim">
                    {item.author_name ?? 'Unknown'} · {formatDateShort(item.created_at)}
                  </p>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="flex flex-col gap-2.5">
              <SectionHeader label="CALENDAR" title="훈련·경기 일정" />

              {isStaff && (
                <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2">
                  <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className={inputCls} placeholder="일정 제목" />
                  <select value={eventType} onChange={(e) => setEventType(e.target.value as TeamEventType)} className={inputCls}>
                    <option value="training">훈련</option>
                    <option value="match">경기</option>
                    <option value="other">기타</option>
                  </select>

                  {/* Date inputs - stacked vertically to prevent overflow */}
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="block font-mono text-[9px] text-text-dim tracking-wider uppercase mb-1">시작</label>
                      <input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} className={`${inputCls} text-xs`} />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] text-text-dim tracking-wider uppercase mb-1">종료 (선택)</label>
                      <input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} className={`${inputCls} text-xs`} />
                    </div>
                  </div>

                  <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className={inputCls} placeholder="장소" />
                  <button onClick={handleCreateEvent} className="w-full py-2.5 border-none rounded-xl font-sans text-[13px] font-extrabold text-bg cursor-pointer" style={{ background: 'var(--bg-gold-gradient)' }}>
                    일정 등록
                  </button>
                </div>
              )}

              {details.events.length === 0 && (
                <div className="py-4 border border-dashed border-border rounded-xl text-center font-sans text-xs text-text-dim">
                  예정된 일정이 없습니다
                </div>
              )}

              {details.events.map((event) => {
                const type = (event.event_type as TeamEventType) || 'other'
                const color = TEAM_EVENT_TYPE_COLOR[type] ?? '#5BBFCF'
                const myStatus = details.myRsvps[event.id] || null

                return (
                  <div
                    key={event.id}
                    className="bg-card rounded-xl p-3 flex flex-col gap-2"
                    style={{ border: `1px solid ${color}30` }}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-sm font-bold text-text flex-1 min-w-0 truncate">{event.title}</p>
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full font-mono text-[9px]"
                        style={{ border: `1px solid ${color}55`, background: `${color}22`, color }}
                      >
                        {TEAM_EVENT_TYPE_LABEL[type]}
                      </span>
                    </div>

                    <p className="font-mono text-[10px] text-text-sec break-keep">
                      {formatDateTime(event.start_at)}
                      {event.end_at ? <> <span className="text-text-dim">~</span> {formatDateTime(event.end_at)}</> : ''}
                    </p>
                    <p className="font-sans text-xs text-text-dim">{event.location || '장소 미정'}</p>

                    <div className="grid grid-cols-3 gap-1.5">
                      {(['going', 'maybe', 'no'] as TeamRsvpStatus[]).map((status) => {
                        const active = myStatus === status
                        return (
                          <button
                            key={status}
                            onClick={() => handleRsvp(event.id, status)}
                            className="py-1.5 px-2 rounded-lg font-mono text-[10px] cursor-pointer"
                            style={{
                              border: `1px solid ${active ? color + '66' : '#2A2F22'}`,
                              background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
                              color: active ? color : '#A8A28A',
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

            {/* Media */}
            <div className="flex flex-col gap-2.5">
              <SectionHeader label="MEDIA" title="팀 미디어" />

              <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2">
                <textarea
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  className={`${inputCls} min-h-[48px] resize-y`}
                  placeholder="업로드 캡션"
                />
                <label className="block w-full py-2.5 border border-border rounded-xl bg-white/[0.03] font-sans text-[13px] font-bold text-text text-center cursor-pointer">
                  {isUploadingMedia ? '업로드 중…' : '파일 선택 후 업로드'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={isUploadingMedia}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      handleUploadTeamMedia(file)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>

              {details.media.length === 0 && (
                <div className="py-4 border border-dashed border-border rounded-xl text-center font-sans text-xs text-text-dim">
                  업로드된 미디어가 없습니다
                </div>
              )}

              {details.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {details.media.map((item) => (
                    <TeamMediaCard key={item.id} media={item} onClaim={handleClaimMedia} claimingId={claimingId} />
                  ))}
                </div>
              )}
            </div>

            {/* Members */}
            <div className="flex flex-col gap-2.5">
              <SectionHeader label="MEMBERS" title="팀 멤버" />

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {details.members.map((member, index) => {
                  const initial = member.player?.display_name?.[0] || 'U'
                  const role = (member.role in TEAM_ROLE_LABEL ? member.role : 'player') as keyof typeof TEAM_ROLE_LABEL
                  return (
                    <div
                      key={`${member.team_id}-${member.user_id}`}
                      className="px-3 py-2.5 flex items-center gap-2.5"
                      style={{ borderBottom: index < details.members.length - 1 ? '1px solid #2A2F22' : 'none' }}
                    >
                      <div className="w-9 h-9 rounded-[11px] shrink-0 flex items-center justify-center font-display font-black text-bg text-base" style={{ background: 'var(--bg-gold-gradient)' }}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] text-text font-bold truncate">
                          {member.player?.display_name || member.user_id.slice(0, 8)}
                        </p>
                        <p className="font-mono text-[10px] text-text-dim truncate">
                          {member.player?.position || 'POS 미정'} · {member.player?.handle ? `@${member.player.handle}` : '핸들 미등록'}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full border border-accent/30 bg-accent-dim font-mono text-[9px] text-accent-light">
                        {TEAM_ROLE_LABEL[role]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
