import { create } from 'zustand'
import { db } from '../db'
import type { Slot } from '../types'

interface SlotsStore {
  slots: Slot[]
  loading: boolean
  load: () => Promise<void>
  add: (slot: Slot) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSlotsStore = create<SlotsStore>((set, get) => ({
  slots: [],
  loading: false,

  load: async () => {
    set({ loading: true })
    const slots = await db.getAllSlots()
    slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    set({ slots, loading: false })
  },

  add: async (slot: Slot) => {
    await db.saveSlot(slot)
    set({ slots: [...get().slots, slot].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) })
  },

  remove: async (id: string) => {
    await db.deleteSlot(id)
    set({ slots: get().slots.filter(s => s.id !== id) })
  },
}))