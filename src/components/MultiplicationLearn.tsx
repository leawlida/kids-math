'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { toArabic } from '@/lib/arabicNum'

const TABLE_COLORS = [
  'from-red-400 to-red-600',
  'from-orange-400 to-orange-600',
  'from-yellow-400 to-yellow-600',
  'from-green-400 to-green-600',
  'from-teal-400 to-teal-600',
  'from-blue-400 to-blue-600',
  'from-indigo-400 to-indigo-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-rose-400 to-rose-600',
]

export function MultiplicationLearn() {
  const setModule = useGameStore(s => s.setModule)
  const startQuiz = useGameStore(s => s.startQuiz)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [quizSettings, setQuizSettings] = useState({
    tables: [] as number[],
    questionCount: 10 as 10 | 20 | 30 | 50,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    mode: 'learn' as 'learn' | 'quiz',
  })

  if (quizSettings.mode === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setQuizSettings(s => ({ ...s, mode: 'learn' }))}
            className="mb-4 text-indigo-600 font-bold flex items-center gap-2">
            ← رجوع
          </button>

          <Card className="mb-4">
            <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">⚙️ إعدادات الاختبار</h2>

            <div className="mb-4">
              <label className="font-bold text-gray-700 block mb-2">اختر الجداول:</label>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => setQuizSettings(s => ({ ...s, tables: s.tables.length === 10 ? [] : Array.from({ length: 10 }, (_, i) => i + 1) }))}
                  className={`p-2 rounded-xl text-sm font-bold border-2 transition-all ${quizSettings.tables.length === 10 ? 'bg-indigo-500 text-white border-indigo-500' : 'border-indigo-200 text-indigo-600'}`}
                >
                  الكل
                </button>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setQuizSettings(s => ({
                      ...s,
                      tables: s.tables.includes(n) ? s.tables.filter(t => t !== n) : [...s.tables, n],
                    }))}
                    className={`p-2 rounded-xl text-sm font-bold border-2 transition-all ${quizSettings.tables.includes(n) ? 'bg-indigo-500 text-white border-indigo-500' : 'border-indigo-200 text-indigo-600'}`}
                  >
                    {toArabic(n)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="font-bold text-gray-700 block mb-2">عدد الأسئلة:</label>
              <div className="flex gap-2">
                {([10, 20, 30, 50] as const).map(n => (
                  <button key={n} onClick={() => setQuizSettings(s => ({ ...s, questionCount: n }))}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${quizSettings.questionCount === n ? 'bg-blue-500 text-white border-blue-500' : 'border-blue-200 text-blue-600'}`}>
                    {toArabic(n)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="font-bold text-gray-700 block mb-2">الصعوبة:</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button key={d} onClick={() => setQuizSettings(s => ({ ...s, difficulty: d }))}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all text-sm ${quizSettings.difficulty === d ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-200 text-purple-600'}`}>
                    {d === 'easy' ? '😊 سهل' : d === 'medium' ? '😐 متوسط' : '😤 صعب'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="success"
              size="xl"
              className="w-full"
              onClick={() => {
                const tables = quizSettings.tables.length ? quizSettings.tables : Array.from({ length: 10 }, (_, i) => i + 1)
                startQuiz({ module: 'multiplication', tables, questionCount: quizSettings.questionCount, difficulty: quizSettings.difficulty })
                setModule('home')
              }}
            >
              ابدأ الاختبار! 🚀
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-indigo-600 font-bold">← رجوع</button>
          <h1 className="text-3xl font-black text-gray-800">✖️ جدول الضرب</h1>
          <Button variant="primary" size="sm" onClick={() => setQuizSettings(s => ({ ...s, mode: 'quiz' }))}>
            اختبار 📝
          </Button>
        </div>

        {selectedTable ? (
          <div>
            <button onClick={() => setSelectedTable(null)} className="mb-4 text-indigo-600 font-bold">← اختر جدول آخر</button>
            <Card gradient={`bg-gradient-to-br ${TABLE_COLORS[selectedTable - 1]}`} className="text-white">
              <h2 className="text-3xl font-black text-center mb-6">جدول الضرب في {toArabic(selectedTable)}</h2>
              <div className="space-y-3">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <div key={n} className="flex items-center justify-between bg-white/20 rounded-2xl px-6 py-4 text-2xl font-black">
                    <span>{toArabic(selectedTable)} × {toArabic(n)}</span>
                    <span>=</span>
                    <span className="text-yellow-300">{toArabic(selectedTable * n)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div>
            <p className="text-center text-gray-600 mb-6 text-lg">اختر الجدول الذي تريد تعلمه</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <Card
                  key={n}
                  onClick={() => setSelectedTable(n)}
                  gradient={`bg-gradient-to-br ${TABLE_COLORS[n - 1]}`}
                  className="text-white text-center py-8"
                >
                  <div className="text-4xl font-black mb-1">{toArabic(n)}</div>
                  <div className="text-sm opacity-80">جدول {toArabic(n)}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
