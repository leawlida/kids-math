'use client'
import { toArabic } from '@/lib/arabicNum'

interface Bar { label: string; value: number; max?: number; color?: string }

export function BarChart({ bars, title, height = 120 }: { bars: Bar[]; title?: string; height?: number }) {
  const maxVal = Math.max(...bars.map(b => b.max ?? b.value), 1)

  return (
    <div>
      {title && <div className="text-sm font-bold text-gray-600 mb-2">{title}</div>}
      <div className="flex items-end gap-1" style={{ height }}>
        {bars.map((bar, i) => {
          const pct = (bar.value / maxVal) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-bold text-gray-600">{bar.value > 0 ? toArabic(bar.value) : ''}</div>
              <div className="w-full rounded-t-lg transition-all" style={{
                height: `${Math.max(pct, bar.value > 0 ? 4 : 0)}%`,
                backgroundColor: bar.color || '#6366f1',
                minHeight: bar.value > 0 ? '4px' : '0',
              }} />
              <div className="text-xs text-gray-500 text-center leading-tight">{bar.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AccuracyRing({ pct, size = 80, label }: { pct: number; size?: number; label?: string }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ transform: `rotate(90deg) translate(0, -${size / 2}px)`, transformOrigin: 'center', fontSize: 14, fontWeight: 900, fill: color }}>
          {toArabic(pct)}٪
        </text>
      </svg>
      {label && <div className="text-xs text-gray-500 text-center">{label}</div>}
    </div>
  )
}

export function MasteryBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-black text-gray-800">{toArabic(pct)}٪</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export function StreakDots({ streak, lastDate }: { streak: number; lastDate: string | null }) {
  const today = new Date().toISOString().slice(0, 10)
  const isActiveToday = lastDate === today

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl font-black text-orange-500">🔥{toArabic(streak)}</div>
      <div className="text-xs text-gray-500 mt-1">يوم متتالي</div>
      <div className="flex gap-1 mt-2">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
          const isToday = d === today
          const active = lastDate && d <= lastDate && streak > (6 - i)
          return (
            <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
              ${active ? 'bg-orange-400 border-orange-400 text-white' : isToday && isActiveToday ? 'bg-orange-400 border-orange-400 text-white' : 'bg-gray-100 border-gray-200'}`}>
              {active || (isToday && isActiveToday) ? '✓' : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
