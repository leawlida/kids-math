'use client'
import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Confetti } from '../ui/Confetti'
import { Stars } from '../ui/Stars'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { toArabic } from '@/lib/arabicNum'

const PRAISE = ['أحسنت! 🎉', 'ممتاز يا بطل! 🏆', 'إجابة رائعة! ⭐', 'رائع جداً! 🌟', 'أنت نجم! 💫']
const TRY_AGAIN = ['حاول مرة أخرى! 💪', 'قريب جداً! 🎯', 'لا تستسلم! 🔥']

function cmpSymbol(answer: number) { return answer === 1 ? '>' : answer === -1 ? '<' : '=' }

function generateChoices(correct: number, isRemainder = false, correctRem?: number): number[][] {
  const choices = new Set<string>()
  choices.add(`${correct}${isRemainder ? `,${correctRem}` : ''}`)
  while (choices.size < 4) {
    const wrong = Math.max(0, correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1))
    const wrongRem = isRemainder ? Math.floor(Math.random() * 9) : undefined
    choices.add(`${wrong}${isRemainder ? `,${wrongRem}` : ''}`)
  }
  return Array.from(choices).map(c => c.split(',').map(Number)).sort(() => Math.random() - 0.5)
}

function ModuleLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    multiplication: '✖️ ضرب',
    division:       '➗ قسمة',
    remainder:      '🔢 قسمة مع باقي',
    addition:       '➕ جمع',
    subtraction:    '➖ طرح',
    comparison:     '⚖️ مقارنة',
  }
  return <div className="text-gray-400 text-sm mb-4">{labels[type] || type}</div>
}

export function QuizEngine() {
  const quizSession = useGameStore(s => s.quizSession)
  const answerQuestion = useGameStore(s => s.answerQuestion)
  const nextQuestion = useGameStore(s => s.nextQuestion)
  const endQuiz = useGameStore(s => s.endQuiz)
  const setModule = useGameStore(s => s.setModule)
  const [input, setInput] = useState('')
  const [remInput, setRemInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'hint' | 'showAnswer' | null>(null)
  const [points, setPoints] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [praiseMsg] = useState(() => PRAISE[Math.floor(Math.random() * PRAISE.length)])
  const [tryAgainMsg] = useState(() => TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)])

  const q = quizSession.questions[quizSession.currentIndex]
  const isLastQuestion = quizSession.currentIndex >= quizSession.questions.length - 1
  const totalQuestions = quizSession.questions.length
  const currentIndex = quizSession.currentIndex
  const progress = (currentIndex / totalQuestions) * 100
  const isComparison = q?.type === 'comparison'

  const [choices, setChoices] = useState<number[][]>([])
  const [showChoices, setShowChoices] = useState(false)

  useEffect(() => {
    setInput('')
    setRemInput('')
    setFeedback(null)
    setShowChoices(false)
    setChoices([])
    if (!isComparison) setTimeout(() => inputRef.current?.focus(), 100)
  }, [currentIndex, isComparison])

  if (!q || !quizSession.active) return null

  function advance() {
    setFeedback(null)
    if (isLastQuestion) { endQuiz(); setIsFinished(true) } else nextQuestion()
  }

  function handleSubmit(answerOverride?: number, remainderOverride?: number) {
    const ans = answerOverride !== undefined ? answerOverride : parseInt(input)
    const rem = q.type === 'remainder' ? (remainderOverride !== undefined ? remainderOverride : parseInt(remInput)) : undefined

    if (isNaN(ans)) return
    if (q.type === 'remainder' && isNaN(rem as number)) return

    const result = answerQuestion(ans, rem)

    if (result.correct) {
      setFeedback('correct')
      setPoints(result.points)
      setShowConfetti(result.points === 2)
      setTimeout(() => setShowConfetti(false), 3000)
      setTimeout(advance, 1500)
    } else if (result.showHint && !isComparison) {
      const c = generateChoices(q.answer, q.type === 'remainder', q.remainder)
      setChoices(c)
      setShowChoices(true)
      setFeedback('hint')
    } else {
      setFeedback('wrong')
      setShakeKey(k => k + 1)
      setTimeout(() => setFeedback(null), 1500)
    }
  }

  function handleChoiceSelect(choice: number[]) {
    const isCorrect = choice[0] === q.answer && (q.type !== 'remainder' || choice[1] === q.remainder)
    if (isCorrect) {
      answerQuestion(choice[0], choice[1])
      setFeedback('correct')
      setPoints(0)
      setTimeout(advance, 1500)
    } else {
      answerQuestion(q.answer, q.remainder)
      setFeedback('showAnswer')
      setTimeout(advance, 2500)
    }
  }

  // ── نتيجة الاختبار ──
  if (isFinished) {
    const correct = quizSession.questions.filter(q => q.correct === true).length
    const totalPts = quizSession.questions.reduce((s, q) => s + q.pointsEarned, 0)
    const pct = Math.round((correct / totalQuestions) * 100)
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-pink-200 flex items-center justify-center p-4" dir="rtl">
        <Confetti active={pct >= 80} />
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">{pct >= 90 ? '🏆' : pct >= 60 ? '⭐' : '📚'}</div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            {pct >= 90 ? 'ممتاز يا بطل!' : pct >= 60 ? 'أحسنت!' : 'استمر في التدريب!'}
          </h2>
          <Stars count={stars} max={3} />
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-emerald-600">{toArabic(correct)}</div>
              <div className="text-gray-500 text-sm">صحيح</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600">{toArabic(pct)}٪</div>
              <div className="text-gray-500 text-sm">النسبة</div>
            </div>
            <div>
              <div className="text-3xl font-black text-yellow-500">⭐{toArabic(totalPts)}</div>
              <div className="text-gray-500 text-sm">النقاط</div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="success" size="lg" className="flex-1"
              onClick={() => {
                useGameStore.getState().startQuiz(quizSession.settings)
                setIsFinished(false)
              }}>
              مجدداً 🔄
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setModule('home')}>
              الرئيسية 🏠
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ── صيغة السؤال ──
  const questionLabel =
    q.type === 'multiplication' ? `${toArabic(q.num1)} × ${toArabic(q.num2)} = ؟` :
    q.type === 'division'       ? `${toArabic(q.num1)} ÷ ${toArabic(q.num2)} = ؟` :
    q.type === 'remainder'      ? `${toArabic(q.num1)} ÷ ${toArabic(q.num2)} = ؟ باقي ؟` :
    q.type === 'addition'       ? `${toArabic(q.num1)} + ${toArabic(q.num2)} = ؟` :
    q.type === 'subtraction'    ? `${toArabic(q.num1)} − ${toArabic(q.num2)} = ؟` :
    /* comparison */              `${toArabic(q.num1)}  __  ${toArabic(q.num2)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4" dir="rtl">
      <Confetti active={showConfetti} />

      {/* شريط التقدم */}
      <div className="max-w-lg mx-auto mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>سؤال {toArabic(currentIndex + 1)} من {toArabic(totalQuestions)}</span>
          <span>{toArabic(Math.round(progress))}٪</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* بطاقة السؤال */}
        <Card
          key={shakeKey}
          className={`mb-6 text-center ${feedback === 'wrong' ? 'animate-shake' : ''}`}
          gradient={
            feedback === 'correct' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
            feedback === 'showAnswer' ? 'bg-gradient-to-br from-orange-300 to-red-400' :
            'bg-white'
          }
        >
          {feedback === 'correct' && (
            <div className="animate-bounce-in">
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-2xl font-black text-white">{praiseMsg}</div>
              {points > 0 && <div className="text-white/80 mt-2">+{toArabic(points)} نقطة!</div>}
            </div>
          )}

          {feedback === 'showAnswer' && (
            <div>
              <div className="text-3xl mb-2">📚</div>
              {q.type === 'remainder' && (
                <>
                  <div className="text-xl font-black text-white">الإجابة: {toArabic(q.answer)} باقي {toArabic(q.remainder!)}</div>
                  <div className="text-white/80 mt-2 text-sm">
                    {toArabic(q.num2)} × {toArabic(q.answer)} = {toArabic(q.num2 * q.answer)}<br />
                    {toArabic(q.num1)} − {toArabic(q.num2 * q.answer)} = {toArabic(q.remainder!)}
                  </div>
                </>
              )}
              {q.type === 'multiplication' && (
                <>
                  <div className="text-xl font-black text-white">الإجابة: {toArabic(q.answer)}</div>
                  <div className="text-white/80 mt-2 text-sm">{toArabic(q.num1)} × {toArabic(q.num2)} = {toArabic(q.answer)}</div>
                </>
              )}
              {q.type === 'division' && (
                <>
                  <div className="text-xl font-black text-white">الإجابة: {toArabic(q.answer)}</div>
                  <div className="text-white/80 mt-2 text-sm">{toArabic(q.num2)} × {toArabic(q.answer)} = {toArabic(q.num1)}</div>
                </>
              )}
              {q.type === 'addition' && (
                <>
                  <div className="text-xl font-black text-white">الإجابة: {toArabic(q.answer)}</div>
                  <div className="text-white/80 mt-2 text-sm">{toArabic(q.num1)} + {toArabic(q.num2)} = {toArabic(q.answer)}</div>
                </>
              )}
              {q.type === 'subtraction' && (
                <>
                  <div className="text-xl font-black text-white">الإجابة: {toArabic(q.answer)}</div>
                  <div className="text-white/80 mt-2 text-sm">{toArabic(q.num1)} − {toArabic(q.num2)} = {toArabic(q.answer)}</div>
                </>
              )}
              {q.type === 'comparison' && (
                <>
                  <div className="text-xl font-black text-white">
                    {toArabic(q.num1)} <span className="text-3xl">{cmpSymbol(q.answer)}</span> {toArabic(q.num2)}
                  </div>
                </>
              )}
            </div>
          )}

          {!feedback && (
            <>
              <ModuleLabel type={q.type} />
              <div className="text-5xl font-black text-gray-800 mb-2">{questionLabel}</div>
              {q.type === 'remainder' && (
                <div className="text-gray-500 text-sm mt-2">أكمل: {toArabic(q.num1)} = {toArabic(q.num2)} × ؟ + ؟</div>
              )}
              {q.type === 'comparison' && (
                <div className="text-gray-400 text-sm mt-2">اختر الرمز المناسب: &gt; أو = أو &lt;</div>
              )}
            </>
          )}

          {feedback === 'wrong' && (
            <div className="text-center">
              <div className="text-3xl mb-2">😅</div>
              <div className="text-lg font-bold text-orange-700">{tryAgainMsg}</div>
              <div className="text-5xl font-black text-gray-800 mt-2">{questionLabel}</div>
            </div>
          )}

          {feedback === 'hint' && !isComparison && (
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <div className="text-lg font-bold text-indigo-700">اختر الإجابة الصحيحة:</div>
              <div className="text-4xl font-black text-gray-800 mt-2">{questionLabel}</div>
            </div>
          )}
        </Card>

        {/* Comparison symbol buttons — always shown */}
        {isComparison && !feedback && (
          <Card>
            <div className="grid grid-cols-3 gap-3">
              {([['>', 1], ['=', 0], ['<', -1]] as const).map(([sym, val]) => (
                <button key={sym} onClick={() => handleSubmit(val)}
                  className="py-6 text-4xl font-black rounded-2xl border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all">
                  {sym}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* حقل الإدخال — not for comparison */}
        {!feedback && !showChoices && !isComparison && (
          <Card>
            {q.type === 'remainder' ? (
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1 text-center">خارج القسمة</label>
                  <input
                    ref={inputRef}
                    type="number"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="w-full border-3 border-indigo-200 rounded-2xl px-4 py-4 text-3xl text-center font-black focus:outline-none focus:border-indigo-500"
                    placeholder="؟"
                    min="0"
                  />
                </div>
                <div className="text-2xl font-black text-gray-400">باقي</div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1 text-center">الباقي</label>
                  <input
                    type="number"
                    value={remInput}
                    onChange={e => setRemInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="w-full border-3 border-indigo-200 rounded-2xl px-4 py-4 text-3xl text-center font-black focus:outline-none focus:border-indigo-500"
                    placeholder="؟"
                    min="0"
                  />
                </div>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="number"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border-3 border-indigo-200 rounded-2xl px-4 py-5 text-4xl text-center font-black focus:outline-none focus:border-indigo-500"
                placeholder="اكتب إجابتك هنا"
                min="0"
              />
            )}
            <Button variant="primary" size="xl" className="w-full mt-4" onClick={() => handleSubmit()}>
              تحقق ✓
            </Button>
          </Card>
        )}

        {/* الاختيار المتعدد */}
        {showChoices && feedback !== 'correct' && feedback !== 'showAnswer' && !isComparison && (
          <Card>
            <p className="text-center text-gray-600 mb-4 font-semibold">اختر الإجابة:</p>
            <div className="grid grid-cols-2 gap-3">
              {choices.map((choice, i) => (
                <Button key={i} variant="outline" size="lg" className="text-2xl font-black" onClick={() => handleChoiceSelect(choice)}>
                  {q.type === 'remainder'
                    ? `${toArabic(choice[0])} باقي ${toArabic(choice[1])}`
                    : toArabic(choice[0])}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
