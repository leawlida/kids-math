'use client'
import { useGameStore } from '@/store/gameStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { toArabic } from '@/lib/arabicNum'

const BADGES_INFO: Record<string, { icon: string; name: string; desc: string }> = {
  master_2: { icon: '🥇', name: 'سيد جدول 2', desc: 'أتقنت جدول الضرب في 2' },
  master_3: { icon: '🥇', name: 'سيد جدول 3', desc: 'أتقنت جدول الضرب في 3' },
  master_4: { icon: '🥇', name: 'سيد جدول 4', desc: 'أتقنت جدول الضرب في 4' },
  master_5: { icon: '🥇', name: 'سيد جدول 5', desc: 'أتقنت جدول الضرب في 5' },
  master_6: { icon: '🥇', name: 'سيد جدول 6', desc: 'أتقنت جدول الضرب في 6' },
  master_7: { icon: '🥇', name: 'سيد جدول 7', desc: 'أتقنت جدول الضرب في 7' },
  master_8: { icon: '🥇', name: 'سيد جدول 8', desc: 'أتقنت جدول الضرب في 8' },
  master_9: { icon: '🥇', name: 'سيد جدول 9', desc: 'أتقنت جدول الضرب في 9' },
  master_10: { icon: '🥇', name: 'سيد جدول 10', desc: 'أتقنت جدول الضرب في 10' },
  division_expert: { icon: '➗', name: 'خبير القسمة', desc: 'أجبت على 50 سؤال قسمة بشكل صحيح' },
  remainder_expert: { icon: '🧩', name: 'خبير الباقي', desc: 'أتقنت القسمة مع الباقي' },
  math_champion: { icon: '🏆', name: 'بطل الرياضيات', desc: 'حققت أعلى مستوى في كل الوحدات' },
  first_quiz: { icon: '🎯', name: 'أول اختبار', desc: 'أكملت أول اختبار لك!' },
  streak_10: { icon: '🔥', name: 'متتالية 10', desc: '10 إجابات صحيحة متتالية' },
  streak_50: { icon: '⚡', name: 'متتالية 50', desc: '50 إجابة صحيحة متتالية' },
  streak_100: { icon: '💥', name: 'متتالية 100', desc: '100 إجابة صحيحة متتالية' },
  correct_100: { icon: '💯', name: '100 صح', desc: 'أجبت على 100 سؤال بشكل صحيح!' },
}

export function Dashboard() {
  const activeProfileId = useGameStore(s => s.activeProfileId)
  const profiles = useGameStore(s => s.profiles)
  const setModule = useGameStore(s => s.setModule)
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null

  if (!activeProfile) return null

  const { stats, badges, achievements, history, points, weakAreas } = activeProfile
  const totalCorrect = stats.multiplicationCorrect + stats.divisionCorrect + stats.remainderCorrect
  const totalAttempts = stats.multiplicationTotal + stats.divisionTotal + stats.remainderTotal
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  const multAccuracy = stats.multiplicationTotal > 0
    ? Math.round((stats.multiplicationCorrect / stats.multiplicationTotal) * 100) : 0
  const divAccuracy = stats.divisionTotal > 0
    ? Math.round((stats.divisionCorrect / stats.divisionTotal) * 100) : 0
  const remAccuracy = stats.remainderTotal > 0
    ? Math.round((stats.remainderCorrect / stats.remainderTotal) * 100) : 0

  // Find weak areas
  const sortedWeak = Object.entries(weakAreas)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const allBadges = Object.keys(BADGES_INFO)
  const earned = allBadges.filter(b => badges.includes(b) || achievements.includes(b))

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100 p-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-orange-600 font-bold">← رجوع</button>
          <h1 className="text-2xl font-black text-gray-800">🏆 إنجازاتي</h1>
          <div />
        </div>

        {/* Profile summary */}
        <Card gradient="bg-gradient-to-br from-amber-400 to-orange-500" className="text-white mb-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{activeProfile.avatar}</span>
            <div>
              <div className="text-2xl font-black">{activeProfile.name}</div>
              <div className="text-3xl font-black">⭐ {toArabic(points)} نقطة</div>
              <div className="text-white/80">🔥 أعلى متتالية: {toArabic(stats.maxStreak)}</div>
            </div>
          </div>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="text-center">
            <div className="text-4xl font-black text-emerald-600">{toArabic(accuracy)}٪</div>
            <div className="text-gray-500 text-sm">الدقة الإجمالية</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-black text-blue-600">{toArabic(totalCorrect)}</div>
            <div className="text-gray-500 text-sm">إجمالي الصحيح</div>
          </Card>
        </div>

        {/* Module breakdown */}
        <Card className="mb-4">
          <h3 className="font-black text-lg text-gray-800 mb-4">📊 أداء كل وحدة</h3>
          {[
            { label: 'جدول الضرب', pct: multAccuracy, color: 'bg-blue-500', icon: '✖️', correct: stats.multiplicationCorrect, total: stats.multiplicationTotal },
            { label: 'القسمة التامة', pct: divAccuracy, color: 'bg-emerald-500', icon: '➗', correct: stats.divisionCorrect, total: stats.divisionTotal },
            { label: 'القسمة مع الباقي', pct: remAccuracy, color: 'bg-orange-500', icon: '🔢', correct: stats.remainderCorrect, total: stats.remainderTotal },
          ].map(({ label, pct, color, icon, correct, total }) => (
            <div key={label} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-700">{icon} {label}</span>
                <span className="font-black text-gray-800">{toArabic(pct)}٪ ({toArabic(correct)}/{toArabic(total)})</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Weak areas */}
        {sortedWeak.length > 0 && (
          <Card className="mb-4">
            <h3 className="font-black text-lg text-gray-800 mb-3">⚠️ المناطق الضعيفة</h3>
            <div className="space-y-2">
              {sortedWeak.map(([key, count]) => {
                const [type, num] = key.split('_')
                const label = type === 'mult' ? `ضرب × ${toArabic(num)}` : type === 'div' ? `قسمة ÷ ${toArabic(num)}` : `قسمة مع باقي ÷ ${toArabic(num)}`
                return (
                  <div key={key} className="flex justify-between items-center bg-red-50 rounded-2xl px-4 py-2 border border-red-100">
                    <span className="font-semibold text-red-700">{label}</span>
                    <span className="text-red-500 text-sm">{toArabic(count)} أخطاء</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Achievements */}
        <Card className="mb-4">
          <h3 className="font-black text-lg text-gray-800 mb-3">🏅 الشارات والإنجازات</h3>
          <div className="grid grid-cols-3 gap-3">
            {allBadges.map(badge => {
              const info = BADGES_INFO[badge]
              const isEarned = earned.includes(badge)
              return (
                <div
                  key={badge}
                  className={`text-center p-3 rounded-2xl border-2 transition-all ${isEarned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}
                  title={info.desc}
                >
                  <div className="text-3xl mb-1">{info.icon}</div>
                  <div className="text-xs font-bold text-gray-700 leading-tight">{info.name}</div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <h3 className="font-black text-lg text-gray-800 mb-3">📅 آخر الاختبارات</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3">
                  <div>
                    <div className="font-semibold text-gray-700">
                      {entry.module === 'multiplication' ? '✖️ ضرب' : entry.module === 'division' ? '➗ قسمة' : '🔢 باقي'}
                    </div>
                    <div className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString('ar-SA')}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-emerald-600">{toArabic(entry.score)}/{toArabic(entry.total)}</div>
                    <div className="text-xs text-yellow-600">⭐ +{toArabic(entry.points)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
