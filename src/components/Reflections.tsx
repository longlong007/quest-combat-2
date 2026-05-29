import { useEffect } from 'react'
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