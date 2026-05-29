import { useState } from 'react'
import type { FormEvent } from 'react'
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

  async function handleSubmit(e: FormEvent) {
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