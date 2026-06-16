'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { toArabic } from '@/lib/arabicNum'

interface DivisionLearnProps {
  withRemainder: boolean
}

export function DivisionLearn({ withRemainder }: DivisionLearnProps) {
  const setModule = useGameStore(s => s.setModule)
  const startQuiz = useGameStore(s => s.startQuiz)
  const moduleKey = withRemainder ? 'remainder' : 'division'
  const [mode, setMode] = useState<'learn' | 'quiz' | 'example'>('learn')
  const [selectedDivisor, setSelectedDivisor] = useState<number | null>(null)
  const [quizTables, setQuizTables] = useState<number[]>([])
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 50>(10)
  const [exampleDividend, setExampleDividend] = useState(29)
  const [exampleDivisor, setExampleDivisor] = useState(6)

  const quotient = Math.floor(exampleDividend / exampleDivisor)
  const remainder = exampleDividend % exampleDivisor

  if (mode === 'example') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-teal-200 p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setMode('learn')} className="mb-4 text-teal-700 font-bold">← رجوع</button>

          <Card className="mb-4">
            <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">
              {withRemainder ? '🔢 مثال تفصيلي مع باقي' : '🎯 مثال تفصيلي'}
            </h2>

            <div className="flex gap-4 mb-6 justify-center">
              <div>
                <label className="text-xs text-gray-500 block mb-1 text-center">المقسوم</label>
                <input
                  type="number"
                  value={exampleDividend}
                  onChange={e => setExampleDividend(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 border-2 border-teal-300 rounded-xl px-3 py-2 text-2xl text-center font-black focus:outline-none focus:border-teal-500"
                  min="1"
                />
              </div>
              <div className="flex items-end pb-2 text-3xl font-black text-teal-600">÷</div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 text-center">المقسوم عليه</label>
                <input
                  type="number"
                  value={exampleDivisor}
                  onChange={e => setExampleDivisor(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 border-2 border-teal-300 rounded-xl px-3 py-2 text-2xl text-center font-black focus:outline-none focus:border-teal-500"
                  min="1"
                />
              </div>
            </div>

            {/* Step by step */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                <div className="text-sm text-blue-600 font-semibold mb-1">الخطوة 1: العملية</div>
                <div className="text-3xl font-black text-center text-gray-800">
                  {toArabic(exampleDividend)} ÷ {toArabic(exampleDivisor)}
                </div>
              </div>

              {withRemainder && (
                <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                  <div className="text-sm text-purple-600 font-semibold mb-1">الخطوة 2: أكبر ضرب</div>
                  <div className="text-xl font-black text-center text-gray-800">
                    {toArabic(exampleDivisor)} × {toArabic(quotient)} = {toArabic(exampleDivisor * quotient)}
                  </div>
                  <div className="text-sm text-center text-gray-500 mt-1">
                    (أكبر مضاعف لـ {toArabic(exampleDivisor)} لا يتجاوز {toArabic(exampleDividend)})
                  </div>
                </div>
              )}

              {!withRemainder && (
                <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                  <div className="text-sm text-purple-600 font-semibold mb-1">الخطوة 2: الضرب العكسي</div>
                  <div className="text-xl font-black text-center text-gray-800">
                    {toArabic(exampleDivisor)} × ؟ = {toArabic(exampleDividend)}
                  </div>
                  <div className="text-xl font-black text-center text-emerald-600 mt-2">
                    {toArabic(exampleDivisor)} × {toArabic(quotient)} = {toArabic(exampleDividend)}
                  </div>
                </div>
              )}

              {withRemainder && (
                <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200">
                  <div className="text-sm text-orange-600 font-semibold mb-1">الخطوة 3: الطرح</div>
                  <div className="text-xl font-black text-center text-gray-800">
                    {toArabic(exampleDividend)} − {toArabic(exampleDivisor * quotient)} = {toArabic(remainder)}
                  </div>
                </div>
              )}

              <div className="bg-emerald-100 rounded-2xl p-6 border-2 border-emerald-400 text-center">
                <div className="text-sm text-emerald-700 font-semibold mb-2">النتيجة:</div>
                <div className="text-4xl font-black text-emerald-800">
                  {toArabic(exampleDividend)} ÷ {toArabic(exampleDivisor)} = {toArabic(quotient)}
                  {withRemainder && remainder > 0 && ` باقي ${toArabic(remainder)}`}
                </div>
                {!withRemainder && remainder !== 0 && (
                  <div className="text-red-500 text-sm mt-2">⚠️ هذه القسمة لها باقٍ ({toArabic(remainder)})</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-teal-200 p-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setMode('learn')} className="mb-4 text-teal-700 font-bold">← رجوع</button>
          <Card>
            <h2 className="text-2xl font-black text-gray-800 mb-4 text-center">⚙️ إعدادات الاختبار</h2>

            <div className="mb-4">
              <label className="font-bold text-gray-700 block mb-2">اختر المقسوم عليه:</label>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => setQuizTables(t => t.length === 10 ? [] : Array.from({ length: 10 }, (_, i) => i + 1))}
                  className={`p-2 rounded-xl text-sm font-bold border-2 ${quizTables.length === 10 ? 'bg-teal-500 text-white border-teal-500' : 'border-teal-200 text-teal-600'}`}
                >الكل</button>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setQuizTables(t => t.includes(n) ? t.filter(x => x !== n) : [...t, n])}
                    className={`p-2 rounded-xl text-sm font-bold border-2 ${quizTables.includes(n) ? 'bg-teal-500 text-white border-teal-500' : 'border-teal-200 text-teal-600'}`}
                  >{toArabic(n)}</button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="font-bold text-gray-700 block mb-2">عدد الأسئلة:</label>
              <div className="flex gap-2">
                {([10, 20, 30, 50] as const).map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 ${questionCount === n ? 'bg-teal-500 text-white border-teal-500' : 'border-teal-200 text-teal-600'}`}>
                    {toArabic(n)}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="success" size="xl" className="w-full" onClick={() => {
              const tables = quizTables.length ? quizTables : Array.from({ length: 10 }, (_, i) => i + 1)
              startQuiz({ module: moduleKey, tables, questionCount })
              setModule('home')
            }}>
              ابدأ الاختبار! 🚀
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-teal-200 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-teal-700 font-bold">← رجوع</button>
          <h1 className="text-3xl font-black text-gray-800">
            {withRemainder ? '🔢 القسمة مع الباقي' : '➗ القسمة التامة'}
          </h1>
          <Button variant="success" size="sm" onClick={() => setMode('quiz')}>اختبار 📝</Button>
        </div>

        {/* Concept explanation */}
        <Card className="mb-4">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            {withRemainder ? '📖 فهم القسمة مع الباقي' : '📖 فهم القسمة التامة'}
          </h2>
          {withRemainder ? (
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-2xl p-3">
                <span className="font-bold text-blue-700">المقسوم (÷)</span>
                <span className="text-gray-600"> — الرقم الكبير الذي نقسمه</span>
              </div>
              <div className="bg-purple-50 rounded-2xl p-3">
                <span className="font-bold text-purple-700">المقسوم عليه</span>
                <span className="text-gray-600"> — الرقم الذي نقسم عليه</span>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-3">
                <span className="font-bold text-emerald-700">خارج القسمة</span>
                <span className="text-gray-600"> — نتيجة القسمة</span>
              </div>
              <div className="bg-orange-50 rounded-2xl p-3">
                <span className="font-bold text-orange-700">الباقي</span>
                <span className="text-gray-600"> — ما يتبقى بعد القسمة (دائماً أصغر من المقسوم عليه)</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-3">القسمة هي عكس الضرب! إذا عرفت جدول الضرب ستحل القسمة بسهولة.</p>
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <div className="text-xl font-black text-blue-800 mb-1">٢٤ ÷ ٦ = ٤</div>
                <div className="text-gray-600">لأن: ٦ × ٤ = ٢٤</div>
              </div>
            </div>
          )}
        </Card>

        {/* Interactive example */}
        <Button variant="secondary" size="lg" className="w-full mb-4" onClick={() => setMode('example')}>
          🔍 جرب مثالاً تفصيلياً
        </Button>

        {/* Example problems */}
        <Card>
          <h3 className="text-lg font-black text-gray-800 mb-4">
            {withRemainder ? '📚 أمثلة' : '📚 أمثلة القسمة التامة'}
          </h3>
          <div className="space-y-3">
            {withRemainder
              ? [[17, 5, 3, 2], [38, 7, 5, 3], [29, 6, 4, 5]].map(([a, b, q, r]) => (
                  <div key={`${a}${b}`} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                    <span className="text-xl font-black">{toArabic(a)} ÷ {toArabic(b)}</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-xl font-black text-emerald-600">{toArabic(q)} باقي {toArabic(r)}</span>
                  </div>
                ))
              : [[42, 7, 6], [63, 9, 7], [80, 10, 8]].map(([a, b, q]) => (
                  <div key={`${a}${b}`} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                    <span className="text-xl font-black">{toArabic(a)} ÷ {toArabic(b)}</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-xl font-black text-emerald-600">{toArabic(q)}</span>
                  </div>
                ))
            }
          </div>
        </Card>
      </div>
    </div>
  )
}
