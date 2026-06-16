'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { toArabic } from '@/lib/arabicNum'

export function SubtractionLearn() {
  const setModule = useGameStore(s => s.setModule)
  const startQuiz = useGameStore(s => s.startQuiz)
  const [mode, setMode] = useState<'learn' | 'quiz' | 'example'>('learn')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 50>(10)
  const [exA, setExA] = useState(20)
  const [exB, setExB] = useState(8)

  const examples = {
    easy:   [[10, 3, 7], [8, 5, 3], [9, 4, 5]],
    medium: [[30, 12, 18], [45, 17, 28], [50, 23, 27]],
    hard:   [[85, 37, 48], [100, 43, 57], [76, 29, 47]],
  }

  if (mode === 'example') {
    const diff = Math.max(0, exA - exB)
    const borrow = exB > exA % 10 ? 1 : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 to-red-200 p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setMode('learn')} className="mb-4 text-red-700 font-bold">← رجوع</button>
          <Card>
            <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">🔍 مثال تفصيلي</h2>
            <div className="flex gap-4 mb-6 justify-center">
              {[
                { label: 'المطروح منه', val: exA, set: setExA },
                { label: 'المطروح', val: exB, set: (v: number) => setExB(Math.min(v, exA)) },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 block mb-1 text-center">{label}</label>
                  <input type="number" value={val} onChange={e => set(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 border-2 border-red-300 rounded-xl px-3 py-2 text-2xl text-center font-black focus:outline-none focus:border-red-500" min="0" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200 text-center">
                <div className="text-sm text-red-600 font-semibold mb-1">العملية</div>
                <div className="text-3xl font-black text-gray-800">{toArabic(exA)} − {toArabic(exB)} = ؟</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200 font-mono text-center">
                <div className="text-2xl font-black text-gray-700">
                  <div className="text-right">{toArabic(exA)}</div>
                  <div className="text-right">− {toArabic(exB)}</div>
                  <div className="border-t-2 border-gray-400 mt-1 pt-1 text-emerald-700 text-right">{toArabic(diff)}</div>
                </div>
              </div>
              <div className="bg-emerald-100 rounded-2xl p-4 border-2 border-emerald-400 text-center">
                <div className="text-4xl font-black text-emerald-800">{toArabic(exA)} − {toArabic(exB)} = {toArabic(diff)}</div>
                <div className="text-sm text-emerald-700 mt-2">للتحقق: {toArabic(diff)} + {toArabic(exB)} = {toArabic(exA)}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 to-red-200 p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setMode('learn')} className="mb-4 text-red-700 font-bold">← رجوع</button>
          <Card>
            <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">⚙️ إعدادات الاختبار</h2>
            <div className="mb-4">
              <label className="font-bold text-gray-700 block mb-2">الصعوبة:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-xl font-bold border-2 text-sm ${difficulty === d ? 'bg-red-500 text-white border-red-500' : 'border-red-200 text-red-600'}`}>
                    {d === 'easy' ? '😊 سهل\n٠-١٠' : d === 'medium' ? '😐 متوسط\n٠-٥٠' : '😤 صعب\n٠-١٠٠'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="font-bold text-gray-700 block mb-2">عدد الأسئلة:</label>
              <div className="flex gap-2">
                {([10, 20, 30, 50] as const).map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 ${questionCount === n ? 'bg-rose-500 text-white border-rose-500' : 'border-rose-200 text-rose-600'}`}>
                    {toArabic(n)}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="danger" size="xl" className="w-full" onClick={() => {
              startQuiz({ module: 'subtraction', difficulty, questionCount })
              setModule('home')
            }}>ابدأ الاختبار! 🚀</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-red-200 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-red-700 font-bold">← رجوع</button>
          <h1 className="text-3xl font-black text-gray-800">➖ الطرح</h1>
          <Button variant="danger" size="sm" onClick={() => setMode('quiz')}>اختبار 📝</Button>
        </div>

        <Card className="mb-4">
          <h2 className="text-xl font-black text-gray-800 mb-3">📖 تعلم الطرح</h2>
          <p className="text-gray-700 mb-4">الطرح يعني إزالة كمية من عدد للحصول على ناتج أصغر!</p>
          <div className="bg-amber-50 rounded-2xl p-3 mb-4 text-sm text-amber-800 font-semibold">
            💡 للتحقق من إجابتك: الناتج + المطروح = المطروح منه
          </div>
          <div className="flex gap-2 mb-4">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 ${difficulty === d ? 'bg-red-500 text-white border-red-500' : 'border-red-200 text-red-600'}`}>
                {d === 'easy' ? '١-١٠' : d === 'medium' ? '١-٥٠' : '١-١٠٠'}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {examples[difficulty].map(([a, b, c]) => (
              <div key={`${a}${b}`} className="flex items-center justify-between bg-red-50 rounded-2xl px-5 py-3 text-xl font-black">
                <span>{toArabic(a)} − {toArabic(b)}</span>
                <span className="text-red-300">=</span>
                <span className="text-red-700">{toArabic(c)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Button variant="secondary" size="lg" className="w-full" onClick={() => setMode('example')}>
          🔍 جرب مثالاً تفصيلياً
        </Button>
      </div>
    </div>
  )
}
