export interface Slot {
  id: string
  startTime: string // ISO string
  durationMin: number
  intentTag: string
  reminderOn: boolean
}

export interface Session {
  id: string
  slotId: string | null
  startedAt: string // ISO string
  endedAt: string | null
  completed: boolean
}

export interface Reflection {
  id: string
  sessionId: string
  text: string
  mood: string
  createdAt: string // ISO string
}

export const INTENT_TAGS = ['读书', '散步', '发呆', '写作', '冥想', '喝茶', '听音乐', '画画'] as const
export type IntentTag = typeof INTENT_TAGS[number]

export const MOOD_OPTIONS = ['😌', '🪷', '✨', '🌿', '💛'] as const
export type Mood = typeof MOOD_OPTIONS[number]