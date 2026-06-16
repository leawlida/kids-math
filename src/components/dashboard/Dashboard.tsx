'use client'
import { useState } from 'react'
import { useGameStore, weeklyPoints, monthlyPoints, dailyPointsLast7, getMasteryLevel, getMasteryLabel, getMasteryColor, avgResponseTime, ModuleType } from '@/store/gameStore'
import { Card } from '../ui/Card'
import { toArabic } from '@/lib/arabicNum'
import { BarChart, AccuracyRing, MasteryBar, StreakDots } from './ProgressChart'

// ─── Badge catalogue ──────────────────────────────────────────────────────────
const BADGES: Record<string, { icon: string; name: string }> = {
  master_2: { icon: '🥇', name: 'جدول ٢' },  master_3: { icon: '🥇', name: 'جدول ٣' },
  master_4: { icon: '🥇', name: 'جدول ٤' },  master_5: { icon: '🥇', name: 'جدول ٥' },
  master_6: { icon: '🥇', name: 'جدول ٦' },  master_7: { icon: '🥇', name: 'جدول ٧' },
  master_8: { icon: '🥇', name: 'جدول ٨' },  master_9: { icon: '🥇', name: 'جدول ٩' },
  master_10: { icon: '🥇', name: 'جدول ١٠' },
  mult_master: { icon: '✖️', name: 'ماهر الضرب' },
  div_master:  { icon: '➗', name: 'ماهر القسمة' },
  add_master:  { icon: '➕', name: 'ماهر الجمع' },
  sub_master:  { icon: '➖', name: 'ماهر الطرح' },
  cmp_master:  { icon: '⚖️', name: 'ماهر المقارنة' },
}

const ACHIEVEMENTS: Record<string, { icon: string; name: string }> = {
  first_quiz:       { icon: '🎯', name: 'أول اختبار' },
  first_correct:    { icon: '✅', name: 'أول إجابة' },
  perfect_quiz:     { icon: '💯', name: 'اختبار مثالي' },
  streak_10:        { icon: '🔥', name: 'سلسلة ١٠' },
  streak_50:        { icon: '⚡', name: 'سلسلة ٥٠' },
  streak_100:       { icon: '💥', name: 'سلسلة ١٠٠' },
  correct_50:       { icon: '🌟', name: '٥٠ صحيح' },
  correct_100:      { icon: '🏅', name: '١٠٠ صحيح' },
  correct_500:      { icon: '🏆', name: '٥٠٠ صحيح' },
  daily_streak_7:   { icon: '📅', name: 'أسبوع متواصل' },
  daily_streak_30:  { icon: '🗓️', name: 'شهر متواصل' },
}

const MODULE_META: { key: ModuleType; label: string; icon: string; correctKey: string; totalKey: string; color: string }[] = [
  { key: 'multiplication', label: 'الضرب',     icon: '✖️', correctKey: 'multiplicationCorrect', totalKey: 'multiplicationTotal', color: '#6366f1' },
  { key: 'division',       label: 'القسمة',    icon: '➗', correctKey: 'divisionCorrect',       totalKey: 'divisionTotal',       color: '#10b981' },
  { key: 'remainder',      label: 'قسمة+باقي', icon: '🧩', correctKey: 'remainderCorrect',      totalKey: 'remainderTotal',      color: '#f59e0b' },
  { key: 'addition',       label: 'الجمع',     icon: '➕', correctKey: 'additionCorrect',       totalKey: 'additionTotal',       color: '#0ea5e9' },
  { key: 'subtraction',    label: 'الطرح',     icon: '➖', correctKey: 'subtractionCorrect',    totalKey: 'subtractionTotal',    color: '#ec4899' },
  { key: 'comparison',     label: 'المقارنة',  icon: '⚖️', correctKey: 'comparisonCorrect',     totalKey: 'comparisonTotal',     color: '#8b5cf6' },
]

type Tab = 'overview' | 'subjects' | 'badges' | 'history'

export function Dashboard() {
  const activeProfileId = useGameStore(s => s.activeProfileId)
  const profiles = useGameStore(s => s.profiles)
  const setModule = useGameStore(s => s.setModule)
  const profile = profiles.find(p => p.id === activeProfileId)
  const [tab, setTab] = useState<Tab>('overview')

  if (!profile) return null

  const { stats, history } = profile
  const totalCorrect = MODULE_META.reduce((s, m) => s + (stats[m.correctKey as keyof typeof stats] as number), 0)
  const totalAttempts = MODULE_META.reduce((s, m) => s + (stats[m.totalKey as keyof typeof stats] as number), 0)
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  const weekly = weeklyPoints(profile)
  const monthly = monthlyPoints(profile)
  const dailyBars = dailyPointsLast7(profile)
  const avgTime = avgResponseTime(profile)

  // Sort weak areas
  const weakAreas = Object.entries(profile.weakAreas)
    .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, 5)

  // Best subjects
  const strongModules = MODULE_META
    .filter(m => (stats[m.totalKey as keyof typeof stats] as number) >= 10)
    .map(m => {
      const c = stats[m.correctKey as keyof typeof stats] as number
      const t = stats[m.totalKey as keyof typeof stats] as number
      return { ...m, pct: t > 0 ? Math.round((c / t) * 100) : 0 }
    })
    .sort((a, b) => b.pct - a.pct)

  const earnedBadges = [...profile.badges, ...profile.achievements]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '📊 ملخص' },
    { id: 'subjects', label: '📚 المواد' },
    { id: 'badges',   label: '🏅 شارات' },
    { id: 'history',  label: '📅 تاريخ' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100 p-4" dir="rtl">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setModule('home')} className="text-orange-600 font-bold">← رجوع</button>
          <h1 className="text-2xl font-black text-gray-800">🏆 لوحة التقدم</h1>
          <div />
        </div>

        {/* Profile card */}
        <Card gradient="bg-gradient-to-br from-amber-400 to-orange-500" className="text-white mb-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{profile.avatar}</span>
            <div className="flex-1">
              <div className="text-2xl font-black">{profile.name}</div>
              <div className="text-xl font-black">⭐ {toArabic(profile.points)} نقطة</div>
              <div className="text-white/80 text-sm">هذا الأسبوع: {toArabic(weekly)} | هذا الشهر: {toArabic(monthly)}</div>
            </div>
            <StreakDots streak={profile.dailyStreak} lastDate={profile.lastActivityDate} />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white/60 p-1 rounded-2xl">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Key stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <AccuracyRing pct={accuracy} size={72} />
                <div className="text-xs text-gray-500 mt-1">الدقة</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-black text-blue-600">{toArabic(totalCorrect)}</div>
                <div className="text-xs text-gray-500 mt-1">إجمالي صحيح</div>
                <div className="text-xs text-gray-400">{toArabic(totalAttempts)} محاولة</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-black text-purple-600">{toArabic(avgTime)}</div>
                <div className="text-xs text-gray-500 mt-1">ثانية/سؤال</div>
                <div className="text-xs text-gray-400">متوسط الوقت</div>
              </Card>
            </div>

            {/* Weekly points chart */}
            <Card>
              <BarChart
                title="نقاط آخر ٧ أيام"
                height={130}
                bars={dailyBars.map(d => ({ label: d.day, value: d.pts, color: '#f59e0b' }))}
              />
            </Card>

            {/* Weak areas */}
            {weakAreas.length > 0 && (
              <Card>
                <h3 className="font-black text-gray-800 mb-3">⚠️ يحتاج مراجعة</h3>
                {weakAreas.map(([key, count]) => {
                  const [prefix, num] = key.split('_')
                  const labels: Record<string, string> = { mult: 'ضرب ×', div: 'قسمة ÷', rem: 'قسمة+باقي ÷', add: 'جمع', sub: 'طرح', cmp: 'مقارنة' }
                  return (
                    <div key={key} className="flex justify-between items-center bg-red-50 rounded-xl px-3 py-2 mb-1 border border-red-100">
                      <span className="font-semibold text-red-700 text-sm">{labels[prefix] || prefix} {isNaN(+num) ? num : toArabic(num)}</span>
                      <span className="text-red-400 text-xs">{toArabic(count)} خطأ</span>
                    </div>
                  )
                })}
              </Card>
            )}

            {/* Strong areas */}
            {strongModules.slice(0, 3).length > 0 && (
              <Card>
                <h3 className="font-black text-gray-800 mb-3">💪 نقاط القوة</h3>
                {strongModules.slice(0, 3).map(m => (
                  <MasteryBar key={m.key} label={`${m.icon} ${m.label}`} pct={m.pct} color={m.color} />
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ── Subjects Tab ── */}
        {tab === 'subjects' && (
          <div className="space-y-3">
            {MODULE_META.map(m => {
              const correct = stats[m.correctKey as keyof typeof stats] as number
              const total = stats[m.totalKey as keyof typeof stats] as number
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0
              const modTime = avgResponseTime(profile, m.key)

              // Aggregate mastery across skills for this module
              const prefix = { multiplication: 'mult', division: 'div', remainder: 'rem', addition: 'add', subtraction: 'sub', comparison: 'cmp' }[m.key]
              const relLogs = Object.entries(profile.skillLog).filter(([k]) => k.startsWith(prefix)).flatMap(([, v]) => v)
              const masteryLevel = getMasteryLevel(relLogs)

              return (
                <Card key={m.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <div className="font-black text-gray-800">{m.label}</div>
                        <span className={`text-xs font-bold ${getMasteryColor(masteryLevel)}`}>
                          {getMasteryLabel(masteryLevel)}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <AccuracyRing pct={pct} size={56} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="font-black text-emerald-600">{toArabic(correct)}</div>
                      <div className="text-gray-400">صحيح</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="font-black text-gray-700">{toArabic(total)}</div>
                      <div className="text-gray-400">إجمالي</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="font-black text-blue-600">{toArabic(modTime)}ث</div>
                      <div className="text-gray-400">متوسط</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* ── Badges Tab ── */}
        {tab === 'badges' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-black text-gray-800 mb-3">🥇 شارات الجداول</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(BADGES).map(([key, info]) => {
                  const earned = earnedBadges.includes(key)
                  return (
                    <div key={key} className={`text-center p-2 rounded-xl border-2 ${earned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
                      <div className="text-2xl">{info.icon}</div>
                      <div className="text-xs font-bold text-gray-700 mt-1 leading-tight">{info.name}</div>
                    </div>
                  )
                })}
              </div>
            </Card>
            <Card>
              <h3 className="font-black text-gray-800 mb-3">🏆 إنجازات</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ACHIEVEMENTS).map(([key, info]) => {
                  const earned = earnedBadges.includes(key)
                  return (
                    <div key={key} className={`text-center p-3 rounded-xl border-2 ${earned ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
                      <div className="text-3xl">{info.icon}</div>
                      <div className="text-xs font-bold text-gray-700 mt-1 leading-tight">{info.name}</div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <Card>
            <h3 className="font-black text-gray-800 mb-3">📅 آخر الاختبارات</h3>
            {history.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد اختبارات بعد</p>}
            <div className="space-y-2">
              {history.slice(0, 20).map((entry, i) => {
                const meta = MODULE_META.find(m => m.key === entry.module)
                const pct = Math.round((entry.score / entry.total) * 100)
                const mins = Math.round((entry.durationMs || 0) / 60000)
                return (
                  <div key={i} className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3">
                    <div>
                      <div className="font-semibold text-gray-700">{meta?.icon} {meta?.label}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString('ar-SA')}
                        {mins > 0 && ` · ${toArabic(mins)} دقيقة`}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-emerald-600">{toArabic(entry.score)}/{toArabic(entry.total)}</div>
                      <div className="text-xs text-gray-500">{toArabic(pct)}٪ · ⭐{toArabic(entry.points)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
