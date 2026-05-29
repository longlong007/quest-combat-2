import { useEffect, useState } from 'react'
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