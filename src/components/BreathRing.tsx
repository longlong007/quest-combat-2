import { useEffect, useRef } from 'react'

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
    const context = ctx

    startRef.current = performance.now()

    function draw(now: number) {
      const elapsed = now - startRef.current
      const progress = (elapsed % breatheCycleMs) / breatheCycleMs
      // ease in-out sine
      const scale = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2
      const radius = minRadius + (maxRadius - minRadius) * scale

      context.clearRect(0, 0, size, size)

      // outer ring
      context.beginPath()
      context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.strokeStyle = `rgba(122, 158, 126, ${0.2 + scale * 0.3})`
      context.lineWidth = 3
      context.stroke()

      // inner dot
      context.beginPath()
      context.arc(cx, cy, 6, 0, Math.PI * 2)
      context.fillStyle = '#7a9e7e'
      context.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, durationMs])

  if (!active) return null
  return <canvas ref={canvasRef} className="w-full aspect-square" />
}