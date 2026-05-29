import { create } from 'zustand'
import { db } from '../db'
import type { Session } from '../types'

type SessionStatus = 'idle' | 'running' | 'done'

interface SessionStore {
  currentSession: Session | null
  status: SessionStatus
  remainingMs: number
  start: (slotId: string | null, durationMin: number) => void
  tick: () => void
  complete: () => Promise<void>
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  status: 'idle',
  remainingMs: 0,

  start: (slotId, durationMin) => {
    const session: Session = {
      id: crypto.randomUUID(),
      slotId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      completed: false,
    }
    set({
      currentSession: session,
      status: 'running',
      remainingMs: durationMin * 60 * 1000,
    })
    db.saveSession(session)
  },

  tick: () => {
    const { remainingMs } = get()
    if (remainingMs <= 0) {
      get().complete()
    } else {
      set({ remainingMs: remainingMs - 1000 })
    }
  },

  complete: async () => {
    const { currentSession } = get()
    if (!currentSession) return
    const updated: Session = { ...currentSession, endedAt: new Date().toISOString(), completed: true }
    await db.saveSession(updated)
    set({ currentSession: updated, status: 'done' })
  },

  reset: () => {
    set({ currentSession: null, status: 'idle', remainingMs: 0 })
  },
}))