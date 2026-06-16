'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { toArabic } from '@/lib/arabicNum'

const SYMBOL_COLOR = { '>': 'text-orange-600', '<': 'text-blue-600', '=': 'text-emerald-600' }

export function ComparisonLearn() {
  const setModule = useGameStore(s => s.setModule)
  const startQuiz = useGameStore(s => s.startQuiz)
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 50>(10)
  const [practiceA, setPracticeA] = useState(7)
  const [practiceB, setPracticeB] = useState(5)
  const [selected, setSelected] = useState<'>' | '<' | '=' | null>(null)

  const correct = practiceA > practiceB ? '>' : practiceA < practiceB ? '<' : '='
  const isCorrect = selected === correct

  const examples = {
    easy:   [[7, 5, '>'], [3, 8, '<'], [6, 6, '=']] as [number, number, string][],
    medium: [[45, 52, '<'], [78, 34, '>'], [61, 61, '=']] as [number, number, string][],
    hard:   [[342, 289, '>'], [156, 421, '<'], [500, 500, '=']] as [number, number, string][],
  }

  if (mode === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-purple-200 p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setMode('learn')} className="mb-4 text-purple-700 font-bold">← رجوع</button>
          <Card>
            <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">⚙️ إعدادات الاختبار</h2>
            <div className="mb-4">
              <label className="font-bold text-gray-700 block mb-2">الصعوبة:</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['easy', '😊 سهل', '١-٩'],
                  ['medium', '😐 متوسط', '١٠-٩٩'],
                  ['hard', '😤 صعب', '١٠٠-٩٩٩'],
                ] as const).map(([d, label, range]) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-xl font-bold border-2 text-sm ${difficulty === d ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-200 text-purple-600'}`}>
                    <div>{label}</div>
                    <div className="text-xs opacity-70">{range}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="font-bold text-gray-700 block mb-2">عدد الأسئلة:</label>
              <div className="flex gap-2">
                {([10, 20, 30, 50] as const).map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 ${questionCount === n ? 'bg-violet-500 text-white border-violet-500' : 'border-violet-200 text-violet-600'}`}>
                    {toArabic(n)}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="secondary" size="xl" className="w-full" onClick={() => {
              startQuiz({ module: 'comparison', difficulty, questionCount })
              setModule('home')
            }}>ابدأ الاختبار! 🚀</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-purple-200 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-purple-700 font-bold">← رجوع</button>
          <h1 className="text-3xl font-black text-gray-800">⚖️ المقارنة</h1>
          <Button variant="secondary" size="sm" onClick={() => setMode('quiz')}>اختبار 📝</Button>
        </div>

        {/* Symbol explanation */}
        <Card className="mb-4">
          <h2 className="text-xl font-black text-gray-800 mb-4">📖 الرموز الثلاثة</h2>
          <div className="grid grid-cols-3 gap-3">
            {([
              ['>', 'أكبر من', 'bg-orange-50 border-orange-200', 'text-orange-600'],
              ['<', 'أصغر من', 'bg-blue-50 border-blue-200', 'text-blue-600'],
              ['=', 'يساوي', 'bg-emerald-50 border-emerald-200', 'text-emerald-600'],
            ] as const).map(([sym, label, bg, col]) => (
              <div key={sym} className={`${bg} border-2 rounded-2xl p-4 text-center`}>
                <div className={`text-5xl font-black ${col} mb-1`}>{sym}</div>
                <div className="text-sm font-bold text-gray-700">{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Examples */}
        <Card className="mb-4">
          <h3 className="text-lg font-black text-gray-800 mb-3">📚 أمثلة</h3>
          <div className="flex gap-2 mb-3">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-1 rounded-xl text-sm font-bold border-2 ${difficulty === d ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-200 text-purple-600'}`}>
                {d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'صعب'}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {examples[difficulty].map(([a, b, sym]) => (
              <div key={`${a}${b}`} className="flex items-center justify-center gap-4 bg-gray-50 rounded-2xl px-5 py-3 text-2xl font-black">
                <span>{toArabic(a)}</span>
                <span className={SYMBOL_COLOR[sym as '>'] || 'text-gray-600'}>{sym}</span>
                <span>{toArabic(b)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Interactive practice */}
        <Card>
          <h3 className="text-lg font-black text-gray-800 mb-4">🎯 تدرب الآن</h3>
          <div className="flex items-center justify-center gap-4 mb-4">
            <input type="number" value={practiceA} onChange={e => { setPracticeA(parseInt(e.target.value) || 0); setSelected(null) }}
              className="w-24 border-2 border-purple-300 rounded-xl px-2 py-2 text-3xl text-center font-black focus:outline-none focus:border-purple-500" />
            <span className={`text-5xl font-black ${selected ? (isCorrect ? 'text-emerald-500' : 'text-red-400') : 'text-gray-300'}`}>
              {selected || '?'}
            </span>
            <input type="number" value={practiceB} onChange={e => { setPracticeB(parseInt(e.target.value) || 0); setSelected(null) }}
              className="w-24 border-2 border-purple-300 rounded-xl px-2 py-2 text-3xl text-center font-black focus:outline-none focus:border-purple-500" />
          </div>
          <div className="flex gap-3">
            {(['>', '=', '<'] as const).map(sym => (
              <button key={sym} onClick={() => setSelected(sym)}
                className={`flex-1 py-4 text-3xl font-black rounded-2xl border-3 transition-all ${
                  selected === sym
                    ? isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-400 text-white border-red-400'
                    : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                }`}>
                {sym}
              </button>
            ))}
          </div>
          {selected && (
            <div className={`mt-3 text-center font-bold text-lg ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
              {isCorrect ? '✅ صحيح!' : `❌ الإجابة الصحيحة: ${correct}`}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
