'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Stars } from './ui/Stars'
import { toArabic } from '@/lib/arabicNum'

const TABLE_THRESHOLD = 90 // percent to advance

export function SalwahMode() {
  const activeProfileId = useGameStore(s => s.activeProfileId)
  const profiles = useGameStore(s => s.profiles)
  const setModule = useGameStore(s => s.setModule)
  const startQuiz = useGameStore(s => s.startQuiz)
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null
  const [showInfo, setShowInfo] = useState(false)

  if (!activeProfile) return null

  const { salwahProgress } = activeProfile
  const { currentTable, tableScores, unlocked } = salwahProgress

  function handleStart(table: number) {
    startQuiz({
      module: 'multiplication',
      tables: [table],
      questionCount: 10,
      difficulty: 'medium',
      adaptive: true,
    })
    setModule('home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-purple-600 font-bold">← رجوع</button>
          <h1 className="text-2xl font-black text-gray-800">🌟 وضع {activeProfile.name}</h1>
          <button onClick={() => setShowInfo(!showInfo)} className="text-purple-500 text-2xl">ℹ️</button>
        </div>

        {showInfo && (
          <Card className="mb-4 bg-purple-50 border-2 border-purple-200">
            <p className="text-purple-800 font-semibold">
              في وضع {activeProfile.name}، تبدأ من جدول ٢ وتتقدم بالترتيب. تحتاج ٩٠٪ أو أكثر للانتقال للجدول التالي.
              إذا انخفض أداؤك، يُعاد الجدول السابق تلقائياً.
            </p>
          </Card>
        )}

        {/* Current table */}
        <Card gradient="bg-gradient-to-br from-pink-500 to-purple-600" className="text-white mb-6">
          <div className="text-center">
            <div className="text-5xl mb-2">👑</div>
            <div className="text-lg opacity-80">أنت الآن عند</div>
            <div className="text-6xl font-black">جدول {toArabic(currentTable)}</div>
            {tableScores[currentTable] !== undefined && (
              <div className="mt-2 text-white/80">آخر نتيجة: {toArabic(tableScores[currentTable])}٪</div>
            )}
          </div>
          <Button
            variant="success"
            size="xl"
            className="w-full mt-4 bg-white/20 hover:bg-white/30 border-2 border-white/50"
            onClick={() => handleStart(currentTable)}
          >
            ابدأ الجدول {toArabic(currentTable)} 🚀
          </Button>
        </Card>

        {/* All tables progress */}
        <h2 className="text-xl font-bold text-gray-700 mb-3">تقدمك في الجداول:</h2>
        <div className="space-y-3">
          {Array.from({ length: 9 }, (_, i) => i + 2).map(table => {
            const score = tableScores[table]
            const isUnlocked = unlocked.includes(table)
            const isCurrent = table === currentTable
            const isPassed = score !== undefined && score >= TABLE_THRESHOLD
            const stars = score !== undefined ? (score >= 90 ? 3 : score >= 70 ? 2 : 1) : 0

            return (
              <Card
                key={table}
                className={`${isCurrent ? 'ring-4 ring-purple-400' : ''} ${!isUnlocked ? 'opacity-50' : ''}`}
                onClick={isUnlocked ? () => handleStart(table) : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {!isUnlocked ? '🔒' : isPassed ? '✅' : isCurrent ? '▶️' : '📖'}
                    </span>
                    <div>
                      <div className="font-black text-lg">جدول {toArabic(table)}</div>
                      {score !== undefined && (
                        <div className="text-sm text-gray-500">نتيجة: {toArabic(score)}٪</div>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    {stars > 0 && <Stars count={stars} max={3} />}
                    {!isUnlocked && <span className="text-gray-400 text-sm">مقفل</span>}
                    {isUnlocked && score === undefined && <span className="text-indigo-400 text-sm">لم يبدأ</span>}
                  </div>
                </div>
                {isUnlocked && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isPassed ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                        style={{ width: `${score || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
