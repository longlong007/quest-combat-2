import { useEffect, useState } from 'react'
import { useSlotsStore } from '../store/slots'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { SlotEditor } from './SlotEditor'
import { format } from '../utils/time'
import type { Slot } from '../types'

export function SlotList() {
  const { slots, load, remove, loading } = useSlotsStore()
  const [showEditor, setShowEditor] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  useEffect(() => { load() }, [])

  if (loading) return <p className="text-center text-ink/50 font-serif mt-8">加载中…</p>

  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif text-ink">我的慢时段</h1>
        <Button size="sm" onClick={() => setShowEditor(true)}>+ 新增</Button>
      </div>

      {showEditor && (
        <SlotEditor
          editSlot={editingSlot}
          onSaved={() => { setShowEditor(false); setEditingSlot(null) }}
        />
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
                onClick={() => { setEditingSlot(slot); setShowEditor(true) }}
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