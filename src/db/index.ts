import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Slot, Session, Reflection } from '../types'

interface SlowDownDB extends DBSchema {
  slots: {
    key: string
    value: Slot
    indexes: { 'by-startTime': string }
  }
  sessions: {
    key: string
    value: Session
    indexes: { 'by-slotId': string }
  }
  reflections: {
    key: string
    value: Reflection
    indexes: { 'by-sessionId': string }
  }
}

let dbPromise: Promise<IDBPDatabase<SlowDownDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SlowDownDB>('slow-down', 1, {
      upgrade(db) {
        const slotStore = db.createObjectStore('slots', { keyPath: 'id' })
        slotStore.createIndex('by-startTime', 'startTime')

        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('by-slotId', 'slotId')

        const reflectionStore = db.createObjectStore('reflections', { keyPath: 'id' })
        reflectionStore.createIndex('by-sessionId', 'sessionId')
      },
    })
  }
  return dbPromise
}

export const db = {
  // Slots
  async getAllSlots(): Promise<Slot[]> {
    const database = await getDB()
    return database.getAll('slots')
  },
  async saveSlot(slot: Slot): Promise<void> {
    const database = await getDB()
    await database.put('slots', slot)
  },
  async deleteSlot(id: string): Promise<void> {
    const database = await getDB()
    await database.delete('slots', id)
  },

  // Sessions
  async saveSession(session: Session): Promise<void> {
    const database = await getDB()
    await database.put('sessions', session)
  },

  // Reflections
  async saveReflection(reflection: Reflection): Promise<void> {
    const database = await getDB()
    await database.put('reflections', reflection)
  },
  async getReflectionsBySession(sessionId: string): Promise<Reflection[]> {
    const database = await getDB()
    return database.getAllFromIndex('reflections', 'by-sessionId', sessionId)
  },
  async getAllReflections(): Promise<Reflection[]> {
    const database = await getDB()
    return database.getAll('reflections')
  },
}