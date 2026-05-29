import { create } from 'zustand'
import { db } from '../db'
import type { Reflection } from '../types'

interface ReflectionsStore {
  reflections: Reflection[]
  load: () => Promise<void>
  add: (reflection: Reflection) => Promise<void>
}

export const useReflectionsStore = create<ReflectionsStore>((set, get) => ({
  reflections: [],

  load: async () => {
    const reflections = await db.getAllReflections()
    reflections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    set({ reflections })
  },

  add: async (reflection: Reflection) => {
    await db.saveReflection(reflection)
    set({ reflections: [reflection, ...get().reflections] })
  },
}))