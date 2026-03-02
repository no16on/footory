import type { Database } from './database'

export type Player = Database['public']['Tables']['players']['Row']
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type PlayerUpdate = Database['public']['Tables']['players']['Update']

export type Position =
  | 'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB'
  | 'DM' | 'CM' | 'AM' | 'LM' | 'RM'
  | 'LW' | 'RW' | 'SS' | 'CF' | 'ST'

export const POSITION_COLORS: Record<string, string> = {
  GK: '#B088CF',
  CB: '#5B9ECF',
  LB: '#5B9ECF',
  RB: '#5B9ECF',
  LWB: '#5B9ECF',
  RWB: '#5B9ECF',
  DM: '#6BCB77',
  CM: '#D4A843',
  AM: '#E8943A',
  LM: '#E8943A',
  RM: '#E8943A',
  LW: '#E8943A',
  RW: '#E8943A',
  SS: '#E85D5D',
  CF: '#E85D5D',
  ST: '#E85D5D',
}

export const POSITIONS: { value: Position; label: string }[] = [
  { value: 'GK', label: '골키퍼' },
  { value: 'CB', label: '센터백' },
  { value: 'LB', label: '레프트백' },
  { value: 'RB', label: '라이트백' },
  { value: 'LWB', label: '레프트윙백' },
  { value: 'RWB', label: '라이트윙백' },
  { value: 'DM', label: '수비형 미드필더' },
  { value: 'CM', label: '중앙 미드필더' },
  { value: 'AM', label: '공격형 미드필더' },
  { value: 'LM', label: '레프트 미드필더' },
  { value: 'RM', label: '라이트 미드필더' },
  { value: 'LW', label: '레프트 윙어' },
  { value: 'RW', label: '라이트 윙어' },
  { value: 'SS', label: '세컨드 스트라이커' },
  { value: 'CF', label: '센터 포워드' },
  { value: 'ST', label: '스트라이커' },
]

export interface ProfileWithTeam extends Player {
  team_name?: string | null
}
