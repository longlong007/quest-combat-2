# 「慢下来」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个手机端优先的 PWA「慢应用」，实现 MVP 完整闭环：设慢时段 → 进慢模式 → 轻反思

**Architecture:** React + TypeScript + Vite 单页应用，通过 PWA 可安装到桌面。数据全存本地（IndexedDB），状态由 Zustand 管理，样式走 Tailwind CSS「慢」美学（留白、柔和、无焦虑感）。

**Tech Stack:** React 18 + TypeScript + Vite + vite-plugin-pwa + Tailwind CSS + Zustand + idb (IndexedDB wrapper) + React Router

---

## File Structure

```
/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
├── public/
│   └── icons/                   # PWA icons
├── src/
│   ├── main.tsx                 # 入口
│   ├── App.tsx                  # 路由 + 布局
│   ├── index.css               # 全局样式 + 字体
│   ├── components/
│   │   ├── SlotList.tsx        # 时段列表页
│   │   ├── SlotEditor.tsx      # 新建/编辑时段表单
│   │   ├── SlowMode.tsx        # 慢模式全屏会话
│   │   ├── ReflectionForm.tsx  # 反思填写
│   │   ├── Reflections.tsx     # 反思历史
│   │   ├── BreathRing.tsx      # 呼吸动效圆环
│   │   └── ui/                  # 基础 UI 组件
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   ├── store/
│   │   ├── slots.ts             # Slots Zustand store
│   │   ├── session.ts           # Session Zustand store
│   │   └── reflections.ts       # Reflections Zustand store
│   ├── db/
│   │   └── index.ts            # IndexedDB 封装（idb）
│   ├── guidance/
│   │   ├── index.ts            # 引导语抽象层接口
│   │   └── local.ts            # MVP 本地引导语库
│   ├── utils/
│   │   └── time.ts             # 时间格式化工具
│   └── types/
│       └── index.ts            # 共享类型定义
└── docs/superpowers/plans/
    └── 2026-05-29-slow-down-app-plan.md
```

**模块职责：**
- `SlotList` / `SlotEditor`：时段管理（增删改查）
- `SlowMode`：慢模式会话全屏状态机（待开始 → 进行中 → 完成）
- `BreathRing`：柔和呼吸动效组件
- `ReflectionForm`：会话结束后的轻反思
- `Reflections`：历史反思回看
- `store/*`：Zustand store，持久化到 IndexedDB
- `guidance/*`：引导语层，MVP 用本地库，预留 AI 接口
- `db/*`：IndexedDB CRUD 封装

---

## Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "slow-down",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.0",
    "zustand": "^5.0.0",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vite-plugin-pwa": "^0.21.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: '慢下来',
        short_name: '慢下来',
        description: '帮你夺回属于自己的时间，回归慢生活',
        theme_color: '#f5f0e8',
        background_color: '#f5f0e8',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

- [ ] **Step 4: 创建 tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        sand: '#e8e0d0',
        moss: '#7a9e7e',
        dusk: '#c4a882',
        ink: '#3d3d3d',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: 创建 postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>慢下来</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cream text-ink antialiased;
    font-family: 'Georgia', serif;
  }
}
```

- [ ] **Step 8: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 9: 创建 src/types/index.ts**

```ts
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
```

- [ ] **Step 10: 初始化项目**

```bash
npm install
```

Run: `npm install`
Expected: 依赖安装完成，无错误

- [ ] **Step 11: 提交**

```bash
git add package.json tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html src/index.css src/main.tsx src/types/index.ts public/icons
git commit -m "chore: scaffold project with React + Vite + PWA + Tailwind"
```

---

## Task 2: IndexedDB 数据层

**Files:**
- Create: `src/db/index.ts`

- [ ] **Step 1: 创建 src/db/index.ts**

```ts
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
```

- [ ] **Step 2: 提交**

```bash
git add src/db/index.ts
git commit -m "feat: add IndexedDB data layer with idb"
```

---

## Task 3: Zustand Stores

**Files:**
- Create: `src/store/slots.ts`
- Create: `src/store/session.ts`
- Create: `src/store/reflections.ts`

- [ ] **Step 1: 创建 src/store/slots.ts**

```ts
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
```

- [ ] **Step 2: 创建 src/store/session.ts**

```ts
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
```

- [ ] **Step 3: 创建 src/store/reflections.ts**

```ts
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
```

- [ ] **Step 4: 提交**

```bash
git add src/store/slots.ts src/store/session.ts src/store/reflections.ts
git commit -m "feat: add Zustand stores for slots, session, and reflections"
```

---

## Task 4: 引导语层（本地库 + 抽象接口）

**Files:**
- Create: `src/guidance/index.ts`
- Create: `src/guidance/local.ts`

- [ ] **Step 1: 创建 src/guidance/local.ts**

```ts
import type { IntentTag } from '../types'

const GUIDANCE_BY_INTENT: Record<string, string[]> = {
  '读书': [
    '翻开书页，让文字带你远行。',
    '此刻，世界很安静，只有你和书。',
    '读几页就好，不必着急。',
  ],
  '散步': [
    '走出去，看看天，吹吹风。',
    '脚步放慢，世界会不一样。',
    '每一步都是和土地的对话。',
  ],
  '发呆': [
    '什么都不用想，就这样待着。',
    '空白也是一种完整。',
    '给自己一段什么都不用做的时光。',
  ],
  '写作': [
    '把心里的声音写下来吧。',
    '不用成文，只是书写本身。',
    '文字会帮你找到自己。',
  ],
  '冥想': [
    '呼吸，把注意力收回到此刻。',
    '身体在，思绪在，就够了。',
    '安静是最深的陪伴。',
  ],
  '喝茶': [
    '泡一杯茶，看茶叶舒展。',
    '茶香里，有时间慢下来的秘密。',
    '一口一口，慢慢喝。',
  ],
  '听音乐': [
    '让旋律流过你，不需要做什么。',
    '闭上眼睛，音乐就是整个世界。',
    '声音会带你到别处。',
  ],
  '画画': [
    '不需要画得好，只是表达。',
    '颜色会说话，你只是管道。',
    '随手的线条，也是心灵的样子。',
  ],
}

const FALLBACK = [
  '这是属于你的时间。',
  '什么都不必做，只需要在这里。',
  '慢下来，世界不会跑掉。',
]

export function getLocalGuidance(intentTag: string): string {
  const list = GUIDANCE_BY_INTENT[intentTag] ?? FALLBACK
  return list[Math.floor(Math.random() * list.length)]
}
```

- [ ] **Step 2: 创建 src/guidance/index.ts**

```ts
import { getLocalGuidance } from './local'

export interface GuidanceProvider {
  getGuidance(intentTag: string): string
}

// MVP: 本地静态引导语库
// 未来可替换为 LLM provider，通过配置切换
export const localGuidanceProvider: GuidanceProvider = {
  getGuidance: getLocalGuidance,
}

// 当前使用的 provider（可注入替换）
export function getGuidance(intentTag: string): string {
  return localGuidanceProvider.getGuidance(intentTag)
}
```

- [ ] **Step 3: 提交**

```bash
git add src/guidance/local.ts src/guidance/index.ts
git commit -m "feat: add local guidance library with abstraction layer for future AI"
```

---

## Task 5: 基础 UI 组件

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Input.tsx`

- [ ] **Step 1: 创建 src/components/ui/Button.tsx**

```tsx
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'rounded-xl font-serif transition-all duration-200 disabled:opacity-40'
  const variants = {
    primary: 'bg-moss text-white hover:bg-moss/90 active:scale-95',
    ghost: 'bg-transparent text-ink hover:bg-sand/50 active:scale-95',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: 创建 src/components/ui/Card.tsx**

```tsx
import React from 'react'

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/60 backdrop-blur rounded-2xl p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: 创建 src/components/ui/Input.tsx**

```tsx
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-ink/60 font-serif">{label}</label>}
      <input
        className={`bg-white/50 border border-sand rounded-xl px-4 py-2.5 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/40 transition-all ${className}`}
        {...props}
      />
    </div>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/ui/Button.tsx src/components/ui/Card.tsx src/components/ui/Input.tsx
git commit -m "feat: add base UI components (Button, Card, Input)"
```

---

## Task 6: 呼吸动效组件

**Files:**
- Create: `src/components/BreathRing.tsx`

- [ ] **Step 1: 创建 src/components/BreathRing.tsx**

```tsx
import React, { useEffect, useRef } from 'react'

interface BreathRingProps {
  active: boolean
  durationMs: number // total session duration in ms
}

export function BreathRing({ active, durationMs }: BreathRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight)
    canvas.width = size
    canvas.height = size
    const cx = size / 2
    const cy = size / 2
    const maxRadius = size * 0.42
    const minRadius = size * 0.28
    const breatheCycleMs = 4000

    startRef.current = performance.now()

    function draw(now: number) {
      const elapsed = now - startRef.current
      const progress = (elapsed % breatheCycleMs) / breatheCycleMs
      // ease in-out sine
      const scale = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2
      const radius = minRadius + (maxRadius - minRadius) * scale

      ctx.clearRect(0, 0, size, size)

      // outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(122, 158, 126, ${0.2 + scale * 0.3})`
      ctx.lineWidth = 3
      ctx.stroke()

      // inner dot
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#7a9e7e'
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, durationMs])

  if (!active) return null
  return <canvas ref={canvasRef} className="w-full aspect-square" />
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/BreathRing.tsx
git commit -m "feat: add BreathRing canvas animation component"
```

---

## Task 7: 时段管理（SlotList + SlotEditor）

**Files:**
- Create: `src/components/SlotList.tsx`
- Create: `src/components/SlotEditor.tsx`

- [ ] **Step 1: 创建 src/components/SlotEditor.tsx**

```tsx
import React, { useState } from 'react'
import { useSlotsStore } from '../store/slots'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import type { IntentTag, Slot } from '../types'
import { INTENT_TAGS } from '../types'

interface SlotEditorProps {
  onSaved: () => void
  editSlot?: Slot | null
}

export function SlotEditor({ onSaved, editSlot }: SlotEditorProps) {
  const add = useSlotsStore(s => s.add)
  const [startTime, setStartTime] = useState(editSlot?.startTime ?? '')
  const [durationMin, setDurationMin] = useState(editSlot?.durationMin?.toString() ?? '30')
  const [intentTag, setIntentTag] = useState<string>(editSlot?.intentTag ?? INTENT_TAGS[0])
  const [reminderOn, setReminderOn] = useState(editSlot?.reminderOn ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const slot: Slot = {
      id: editSlot?.id ?? crypto.randomUUID(),
      startTime: new Date(startTime).toISOString(),
      durationMin: parseInt(durationMin, 10),
      intentTag: intentTag as IntentTag,
      reminderOn,
    }
    await add(slot)
    onSaved()
  }

  return (
    <Card className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="开始时间"
          type="datetime-local"
          value={startTime.slice(0, 16)}
          onChange={e => setStartTime(e.target.value)}
          required
        />
        <Input
          label="时长（分钟）"
          type="number"
          min="5"
          max="180"
          value={durationMin}
          onChange={e => setDurationMin(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink/60 font-serif">想做什么</span>
          <div className="flex flex-wrap gap-2">
            {INTENT_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setIntentTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-serif transition-all ${
                  intentTag === tag
                    ? 'bg-moss text-white'
                    : 'bg-sand/50 text-ink hover:bg-sand'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/60 font-serif cursor-pointer">
          <input
            type="checkbox"
            checked={reminderOn}
            onChange={e => setReminderOn(e.target.checked)}
            className="accent-moss"
          />
          开启提醒
        </label>
        <Button type="submit">{editSlot ? '保存' : '添加时段'}</Button>
      </form>
    </Card>
  )
}
```

- [ ] **Step 2: 创建 src/components/SlotList.tsx**

```tsx
import React, { useEffect, useState } from 'react'
import { useSlotsStore } from '../store/slots'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { SlotEditor } from './SlotEditor'
import { format } from '../utils/time'

export function SlotList() {
  const { slots, load, remove, loading } = useSlotsStore()
  const [showEditor, setShowEditor] = useState(false)
  const [editingSlot, setEditingSlot] = useState<null | string>(null)

  useEffect(() => { load() }, [])

  if (loading) return <p className="text-center text-ink/50 font-serif mt-8">加载中…</p>

  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif text-ink">我的慢时段</h1>
        <Button size="sm" onClick={() => setShowEditor(true)}>+ 新增</Button>
      </div>

      {showEditor && (
        <SlotEditor onSaved={() => { setShowEditor(false); setEditingSlot(null) }} />
      )}

      {slots.length === 0 && !showEditor && (
        <Card className="text-center py-8">
          <p className="text-ink/50 font-serif">还没有慢时段，</p>
          <p className="text-ink/50 font-serif">点击上方按钮添加第一个</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {slots.map(slot => (
          <Card key={slot.id} className="flex items-center justify-between">
            <div>
              <p className="font-serif text-ink font-medium">
                {format(slot.startTime)} · {slot.durationMin} 分钟
              </p>
              <p className="text-sm text-moss font-serif mt-0.5">{slot.intentTag}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setEditingSlot(slot.id); setShowEditor(true) }}
              >
                编辑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => remove(slot.id)}
              >
                删除
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建 src/utils/time.ts**

```ts
export function format(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/SlotList.tsx src/components/SlotEditor.tsx src/utils/time.ts
git commit -m "feat: add SlotList and SlotEditor components"
```

---

## Task 8: 慢模式会话（SlowMode）

**Files:**
- Create: `src/components/SlowMode.tsx`

- [ ] **Step 1: 创建 src/components/SlowMode.tsx**

```tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/session'
import { useSlotsStore } from '../store/slots'
import { BreathRing } from './BreathRing'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { getGuidance } from '../guidance'
import { formatCountdown } from '../utils/time'

interface SlowModeProps {
  slotId?: string | null
}

export function SlowMode({ slotId = null }: SlowModeProps) {
  const navigate = useNavigate()
  const { status, remainingMs, start, tick, complete, reset } = useSessionStore()
  const { slots } = useSlotsStore()
  const [guidance, setGuidance] = useState('')
  const [showEnd, setShowEnd] = useState(false)

  const slot = slotId ? slots.find(s => s.id === slotId) : null
  const durationMin = slot?.durationMin ?? 30
  const intentTag = slot?.intentTag ?? '发呆'

  useEffect(() => {
    if (status === 'idle') {
      start(slotId, durationMin)
      setGuidance(getGuidance(intentTag))
    }
  }, [])

  useEffect(() => {
    if (status !== 'running') return
    const interval = setInterval(() => tick(), 1000)
    return () => clearInterval(interval)
  }, [status, tick])

  useEffect(() => {
    if (status === 'done' && !showEnd) setShowEnd(true)
  }, [status])

  if (status === 'done' && showEnd) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <Card className="max-w-sm text-center flex flex-col gap-6">
          <h2 className="text-xl font-serif text-ink">慢下来了 🌿</h2>
          <p className="text-ink/70 font-serif leading-relaxed">{guidance}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(`/reflect/${useSessionStore.getState().currentSession?.id}`)}>
              记录此刻的感受
            </Button>
            <Button variant="ghost" onClick={() => { reset(); navigate('/') }}>
              返回
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (status !== 'running') return null

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="text-center">
          <p className="text-ink/50 text-sm font-serif uppercase tracking-widest">慢模式</p>
          <h2 className="text-2xl font-serif text-ink mt-1">{intentTag}</h2>
        </div>

        <BreathRing active={status === 'running'} durationMs={durationMin * 60 * 1000} />

        <div className="text-center">
          <p className="text-5xl font-serif text-ink tabular-nums">{formatCountdown(remainingMs)}</p>
          <p className="text-ink/40 text-sm font-serif mt-2">{guidance}</p>
        </div>

        <Button
          variant="ghost"
          onClick={() => { complete() }}
        >
          提前结束
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/SlowMode.tsx
git commit -m "feat: add SlowMode full-screen session component"
```

---

## Task 9: 反思（ReflectionForm + Reflections）

**Files:**
- Create: `src/components/ReflectionForm.tsx`
- Create: `src/components/Reflections.tsx`

- [ ] **Step 1: 创建 src/components/ReflectionForm.tsx**

```tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReflectionsStore } from '../store/reflections'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import type { Mood, Reflection } from '../types'
import { MOOD_OPTIONS } from '../types'

interface ReflectionFormProps {
  sessionId: string
}

export function ReflectionForm({ sessionId }: ReflectionFormProps) {
  const navigate = useNavigate()
  const add = useReflectionsStore(s => s.add)
  const [text, setText] = useState('')
  const [mood, setMood] = useState<Mood>(MOOD_OPTIONS[0])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const reflection: Reflection = {
      id: crypto.randomUUID(),
      sessionId,
      text: text.trim(),
      mood,
      createdAt: new Date().toISOString(),
    }
    await add(reflection)
    navigate('/reflections')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Card className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-ink/50 text-sm font-serif uppercase tracking-widest">慢下来之后</p>
          <h2 className="text-xl font-serif text-ink mt-2">此刻的感受是什么？</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-ink/60 font-serif">心情</span>
            <div className="flex gap-3 text-2xl">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`transition-transform ${mood === m ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="写下一两句…"
            rows={3}
            className="bg-white/50 border border-sand rounded-xl px-4 py-3 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/40 resize-none font-serif"
            required
          />

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">保存</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>跳过</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 创建 src/components/Reflections.tsx**

```tsx
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useReflectionsStore } from '../store/reflections'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { format } from '../utils/time'

export function Reflections() {
  const { reflections, load } = useReflectionsStore()

  useEffect(() => { load() }, [])

  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif text-ink">生活片段</h1>
        <Link to="/">
          <Button size="sm" variant="ghost">返回</Button>
        </Link>
      </div>

      {reflections.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-ink/50 font-serif">还没有记录，</p>
          <p className="text-ink/50 font-serif">完成第一次慢模式后来这里写点什么吧</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {reflections.map(r => (
          <Card key={r.id}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{r.mood}</span>
              <div className="flex-1">
                <p className="text-ink font-serif leading-relaxed">{r.text}</p>
                <p className="text-ink/40 text-xs font-serif mt-2">{format(r.createdAt)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ReflectionForm.tsx src/components/Reflections.tsx
git commit -m "feat: add ReflectionForm and Reflections components"
```

---

## Task 10: 路由与应用入口

**Files:**
- Create: `src/App.tsx`

- [ ] **Step 1: 创建 src/App.tsx**

```tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SlotList } from './components/SlotList'
import { SlowMode } from './components/SlowMode'
import { Reflections } from './components/Reflections'
import { ReflectionForm } from './components/ReflectionForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SlotList />} />
        <Route path="/slow/:slotId" element={<SlowMode />} />
        <Route path="/slow" element={<SlowMode />} />
        <Route path="/reflect/:sessionId" element={<ReflectionForm />} />
        <Route path="/reflections" element={<Reflections />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: 创建 public/icons 占位目录并添加 README**

```bash
mkdir -p public/icons
echo "Place 192x192 and 512x512 PNG icons here" > public/icons/README.txt
```

- [ ] **Step 3: 提交**

```bash
git add src/App.tsx public/icons
git commit -m "feat: add routing and App entry point"
```

---

## Task 11: 构建验证

- [ ] **Step 1: 构建测试**

Run: `npm run build`
Expected: 编译成功，dist/ 目录生成

- [ ] **Step 2: 开发服务器验证**

Run: `npm run dev`
Expected: http://localhost:5173 可访问

- [ ] **Step 3: 提交构建配置**

```bash
git add vite.config.ts # 确保 PWA 配置最新
git commit -m "chore: verify build passes"
```

---

## 自检清单

1. **Spec 覆盖**：时段管理 ✅，慢模式会话 ✅，呼吸动效 ✅，轻反思 ✅，历史回看 ✅，引导语层 ✅，本地存储 ✅，PWA ✅
2. **占位符扫描**：无 TBD/TODO/不完整描述
3. **类型一致性**：Slot / Session / Reflection 接口在 types/index.ts 统一定义，各 store 引用一致
4. **无重复**：每块代码只出现在一个 Task 中