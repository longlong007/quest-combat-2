import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReflectionsStore } from '../store/reflections'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import type { Mood, Reflection } from '../types'
import { MOOD_OPTIONS } from '../types'

export function ReflectionForm() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const add = useReflectionsStore(s => s.add)
  const [text, setText] = useState('')
  const [mood, setMood] = useState<Mood>(MOOD_OPTIONS[0])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const id = sessionId!
    const reflection: Reflection = {
      id: crypto.randomUUID(),
      sessionId: id,
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