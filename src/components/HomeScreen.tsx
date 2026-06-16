'use client'
import { useGameStore } from '@/store/gameStore'
import { Card } from './ui/Card'
import { toArabic } from '@/lib/arabicNum'

const MODULES = [
  { id: 'multiplication' as const, title: 'جدول الضرب',    desc: 'تعلم جداول الضرب من ١ إلى ١٠', gradient: 'bg-gradient-to-br from-blue-400 to-indigo-600',   emoji: '✖️' },
  { id: 'division'       as const, title: 'القسمة التامة', desc: 'قسمة بدون باقي',                gradient: 'bg-gradient-to-br from-emerald-400 to-teal-600',  emoji: '➗' },
  { id: 'remainder'      as const, title: 'قسمة مع الباقي',desc: 'قسمة مع خارج قسمة وباقي',       gradient: 'bg-gradient-to-br from-orange-400 to-red-500',    emoji: '🧩' },
  { id: 'addition'       as const, title: 'الجمع',         desc: 'جمع الأرقام بسهولة وسرعة',       gradient: 'bg-gradient-to-br from-sky-400 to-blue-500',      emoji: '➕' },
  { id: 'subtraction'    as const, title: 'الطرح',         desc: 'تعلم الطرح خطوة خطوة',          gradient: 'bg-gradient-to-br from-rose-400 to-red-600',      emoji: '➖' },
  { id: 'comparison'     as const, title: 'المقارنة',      desc: 'أكبر من، أصغر من، يساوي',       gradient: 'bg-gradient-to-br from-violet-400 to-purple-600', emoji: '⚖️' },
  { id: 'salwah'         as const, title: 'وضع سلوى',      desc: 'تعلم تدريجي مع تتبع التقدم',    gradient: 'bg-gradient-to-br from-pink-400 to-purple-600',   emoji: '👑' },
  { id: 'dashboard'      as const, title: 'إنجازاتي',      desc: 'شاهد نقاطك وشاراتك وتقدمك',     gradient: 'bg-gradient-to-br from-yellow-400 to-orange-400', emoji: '🏆' },
]

export function HomeScreen() {
  const activeProfileId = useGameStore(s => s.activeProfileId)
  const profiles = useGameStore(s => s.profiles)
  const setModule = useGameStore(s => s.setModule)
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null

  if (!activeProfile) return null

  const { stats } = activeProfile
  const totalCorrect = stats.multiplicationCorrect + stats.divisionCorrect + stats.remainderCorrect + stats.additionCorrect + stats.subtractionCorrect + stats.comparisonCorrect
  const totalAttempts = stats.multiplicationTotal + stats.divisionTotal + stats.remainderTotal + stats.additionTotal + stats.subtractionTotal + stats.comparisonTotal
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 bg-white/70 backdrop-blur rounded-3xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{activeProfile.avatar}</span>
          <div>
            <div className="font-black text-xl text-gray-800">{activeProfile.name}</div>
            <div className="text-indigo-600 font-bold">⭐ {toArabic(activeProfile.points)} نقطة</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-black text-2xl text-emerald-600">{toArabic(accuracy)}٪</div>
            <div className="text-gray-500">الدقة</div>
          </div>
          <div className="text-center">
            <div className="font-black text-2xl text-orange-500">🔥{toArabic(activeProfile.dailyStreak)}</div>
            <div className="text-gray-500">أيام</div>
          </div>
          <button
            onClick={() => useGameStore.setState({ activeProfileId: null })}
            className="text-gray-400 hover:text-gray-600 text-xl p-2"
            title="تغيير المستخدم"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-gray-800 mb-1">
          أهلاً {activeProfile.name}! 👋
        </h1>
        <p className="text-gray-500 text-lg">ماذا تريد أن تتعلم اليوم؟</p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {MODULES.map(mod => (
          <Card
            key={mod.id}
            onClick={() => setModule(mod.id)}
            gradient={mod.gradient}
            className="text-white"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{mod.emoji}</span>
              <div>
                <div className="font-black text-lg leading-tight">{mod.title}</div>
                <div className="text-white/80 text-xs mt-0.5">{mod.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick stats */}
      {totalAttempts > 0 && (
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur rounded-3xl p-4 shadow-md">
            <h3 className="font-bold text-gray-700 mb-3 text-center">📊 إحصائياتي</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-black text-blue-600">{toArabic(totalCorrect)}</div>
                <div className="text-xs text-gray-500">إجابات صحيحة</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">{toArabic(accuracy)}٪</div>
                <div className="text-xs text-gray-500">الدقة</div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-500">{toArabic(stats.maxAnswerStreak)}</div>
                <div className="text-xs text-gray-500">أفضل متتالية</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
