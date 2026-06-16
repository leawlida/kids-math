import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModuleType = 'multiplication' | 'division' | 'remainder' | 'addition' | 'subtraction' | 'comparison'
export type AppScreen = 'home' | ModuleType | 'salwah' | 'dashboard' | 'parent'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type MasteryLevel = 'beginner' | 'learning' | 'practicing' | 'mastered'

export interface SkillAttempt {
  correct: boolean
  timestamp: string
  responseTimeMs: number
}

export interface HistoryEntry {
  date: string
  module: ModuleType
  score: number
  total: number
  points: number
  durationMs: number
}

export interface QuizQuestion {
  id: string
  type: ModuleType
  num1: number
  num2: number
  answer: number       // for comparison: -1 (<), 0 (=), 1 (>)
  remainder?: number
  attempts: number
  correct: boolean | null
  pointsEarned: number
  timeSpent: number
  startedAt: number
}

export interface QuizSettings {
  module: ModuleType
  tables?: number[]        // mult / div / rem
  questionCount: 10 | 20 | 30 | 50
  difficulty?: Difficulty
  adaptive?: boolean
}

export interface Profile {
  id: string
  name: string
  avatar: string
  points: number
  badges: string[]
  achievements: string[]
  dailyStreak: number
  lastActivityDate: string | null   // 'YYYY-MM-DD'
  stats: {
    multiplicationCorrect: number; multiplicationTotal: number
    divisionCorrect: number;       divisionTotal: number
    remainderCorrect: number;      remainderTotal: number
    additionCorrect: number;       additionTotal: number
    subtractionCorrect: number;    subtractionTotal: number
    comparisonCorrect: number;     comparisonTotal: number
    answerStreak: number
    maxAnswerStreak: number
    totalLearningMs: number
  }
  weakAreas: Record<string, number>
  skillLog: Record<string, SkillAttempt[]>   // up to 20 attempts per skill
  salwahProgress: {
    currentTable: number
    tableScores: Record<number, number>
    unlocked: number[]
  }
  history: HistoryEntry[]
}

interface GameState {
  profiles: Profile[]
  activeProfileId: string | null
  currentModule: AppScreen
  quizSession: {
    active: boolean
    questions: QuizQuestion[]
    currentIndex: number
    startTime: number
    settings: QuizSettings
  }
  activeProfile: () => Profile | null
  setActiveProfile: (id: string) => void
  addProfile: (name: string, avatar: string) => void
  setModule: (module: AppScreen) => void
  startQuiz: (settings: QuizSettings) => void
  answerQuestion: (answer: number, remainder?: number) => { correct: boolean; points: number; showHint: boolean }
  nextQuestion: () => void
  endQuiz: () => void
  awardBadge: (profileId: string, badge: string) => void
  checkAchievements: (profileId: string) => void
}

// ─── Mastery helper ───────────────────────────────────────────────────────────

export function getMasteryLevel(log: SkillAttempt[]): MasteryLevel {
  if (log.length < 3) return 'beginner'
  const recent = log.slice(-10)
  const rate = recent.filter(a => a.correct).length / recent.length
  if (rate >= 0.9 && recent.length >= 5) return 'mastered'
  if (rate >= 0.7) return 'practicing'
  if (rate >= 0.4) return 'learning'
  return 'beginner'
}

export function getMasteryColor(level: MasteryLevel) {
  return { beginner: 'text-gray-400', learning: 'text-orange-500', practicing: 'text-blue-500', mastered: 'text-emerald-500' }[level]
}

export function getMasteryLabel(level: MasteryLevel) {
  return { beginner: 'مبتدئ', learning: 'يتعلم', practicing: 'يتدرب', mastered: 'متقن' }[level]
}

// ─── Question generators ──────────────────────────────────────────────────────

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

function skillKey(type: ModuleType, context: number | string) {
  const prefix = { multiplication: 'mult', division: 'div', remainder: 'rem', addition: 'add', subtraction: 'sub', comparison: 'cmp' }[type]
  return `${prefix}_${context}`
}

function weightedPick(items: number[], getWeight: (item: number) => number): number {
  const weighted: number[] = []
  items.forEach(item => {
    const w = Math.max(1, getWeight(item))
    for (let i = 0; i < w; i++) weighted.push(item)
  })
  return weighted[Math.floor(Math.random() * weighted.length)]
}

function genMult(tables: number[], diff: Difficulty, weak: Record<string, number>): QuizQuestion {
  const table = weightedPick(tables, t => 1 + (weak[`mult_${t}`] || 0))
  const max = diff === 'easy' ? 5 : 10
  const multiplier = randInt(1, max)
  return { id: Math.random().toString(36).slice(2), type: 'multiplication', num1: table, num2: multiplier, answer: table * multiplier, attempts: 0, correct: null, pointsEarned: 0, timeSpent: 0, startedAt: 0 }
}

function genDiv(tables: number[], weak: Record<string, number>): QuizQuestion {
  const divisor = weightedPick(tables, t => 1 + (weak[`div_${t}`] || 0))
  const quotient = randInt(1, 10)
  return { id: Math.random().toString(36).slice(2), type: 'division', num1: divisor * quotient, num2: divisor, answer: quotient, attempts: 0, correct: null, pointsEarned: 0, timeSpent: 0, startedAt: 0 }
}

function genRem(tables: number[], weak: Record<string, number>): QuizQuestion {
  const divisor = weightedPick(tables, t => 1 + (weak[`rem_${t}`] || 0))
  const quotient = randInt(1, 10)
  const remainder = divisor > 1 ? randInt(1, divisor - 1) : 0
  return { id: Math.random().toString(36).slice(2), type: 'remainder', num1: divisor * quotient + remainder, num2: divisor, answer: quotient, remainder, attempts: 0, correct: null, pointsEarned: 0, timeSpent: 0, startedAt: 0 }
}

function genAdd(diff: Difficulty, weak: Record<string, number>): QuizQuestion {
  const max = diff === 'easy' ? 10 : diff === 'medium' ? 50 : 100
  const num1 = randInt(1, max)
  const num2 = randInt(1, max)
  return { id: Math.random().toString(36).slice(2), type: 'addition', num1, num2, answer: num1 + num2, attempts: 0, correct: null, pointsEarned: 0, timeSpent: 0, startedAt: 0 }
}

function genSub(diff: Difficulty, weak: Record<string, number>): QuizQuestion {
  const max = diff === 'easy' ? 10 : diff === 'medium' ? 50 : 100
  const num1 = randInt(2, max)
  const num2 = randInt(1, num1)
  return { id: Math.random().toString(36).slice(2), type: 'subtraction', num1, num2, answer: num1 - num2, attempts: 0, correct: null, pointsEarned: 0, timeSpent: 0, startedAt: 0 }
}

function genCmp(diff: Difficulty): QuizQuestion {
  const max = diff === 'easy' ? 9 : diff === 'medium' ? 99 : 999
  const min = diff === 'easy' ? 1 : diff === 'medium' ? 10 : 100
  const useEqual = Math.random() < 0.25
  const num1 = randInt(min, max)
  const num2 = useEqual ? num1 : randInt(min, max)
  const answer = num1 > num2 ? 1 : num1 < num2 ? -1 : 0
  return { id: Math.random().toString(36).slice(2), type: 'comparison', num1, num2, answer, attempts: 0, correct: null, pointsEarned: 0, timeSpent: 0, startedAt: 0 }
}

function generateQuestions(settings: QuizSettings, weak: Record<string, number>): QuizQuestion[] {
  const tables = settings.tables?.length ? settings.tables : Array.from({ length: 10 }, (_, i) => i + 1)
  const diff = settings.difficulty || 'medium'
  return Array.from({ length: settings.questionCount }, () => {
    switch (settings.module) {
      case 'multiplication': return genMult(tables, diff, weak)
      case 'division':       return genDiv(tables, weak)
      case 'remainder':      return genRem(tables, weak)
      case 'addition':       return genAdd(diff, weak)
      case 'subtraction':    return genSub(diff, weak)
      case 'comparison':     return genCmp(diff)
    }
  })
}

// ─── Default profile ──────────────────────────────────────────────────────────

function defaultProfile(name: string, avatar: string): Profile {
  return {
    id: Math.random().toString(36).slice(2),
    name, avatar,
    points: 0,
    badges: [],
    achievements: [],
    dailyStreak: 0,
    lastActivityDate: null,
    stats: {
      multiplicationCorrect: 0, multiplicationTotal: 0,
      divisionCorrect: 0,       divisionTotal: 0,
      remainderCorrect: 0,      remainderTotal: 0,
      additionCorrect: 0,       additionTotal: 0,
      subtractionCorrect: 0,    subtractionTotal: 0,
      comparisonCorrect: 0,     comparisonTotal: 0,
      answerStreak: 0,
      maxAnswerStreak: 0,
      totalLearningMs: 0,
    },
    weakAreas: {},
    skillLog: {},
    salwahProgress: { currentTable: 2, tableScores: {}, unlocked: [2] },
    history: [],
  }
}

// ─── Daily streak helper ───────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().slice(0, 10) }

function updateStreak(profile: Profile): Pick<Profile, 'dailyStreak' | 'lastActivityDate'> {
  const today = todayStr()
  if (profile.lastActivityDate === today) return { dailyStreak: profile.dailyStreak, lastActivityDate: today }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const streakContinues = profile.lastActivityDate === yesterday
  return { dailyStreak: streakContinues ? profile.dailyStreak + 1 : 1, lastActivityDate: today }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      currentModule: 'home' as AppScreen,
      quizSession: {
        active: false, questions: [], currentIndex: 0, startTime: 0,
        settings: { module: 'multiplication', questionCount: 10 },
      },

      activeProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find(p => p.id === activeProfileId) ?? null
      },

      setActiveProfile: (id) => set({ activeProfileId: id, currentModule: 'home' }),

      addProfile: (name, avatar) => {
        const profile = defaultProfile(name, avatar)
        set(s => ({ profiles: [...s.profiles, profile], activeProfileId: profile.id }))
      },

      setModule: (module) => set({ currentModule: module }),

      startQuiz: (settings) => {
        const profile = get().activeProfile()
        const questions = generateQuestions(settings, profile?.weakAreas ?? {})
        set({
          quizSession: { active: true, questions, currentIndex: 0, startTime: Date.now(), settings },
        })
      },

      answerQuestion: (answer, remainder) => {
        const { quizSession, profiles, activeProfileId } = get()
        const q = quizSession.questions[quizSession.currentIndex]
        if (!q) return { correct: false, points: 0, showHint: false }

        const isCorrect = q.type === 'remainder'
          ? answer === q.answer && remainder === q.remainder
          : answer === q.answer

        const newAttempts = q.attempts + 1
        const showHint = !isCorrect && newAttempts >= 2
        const points = isCorrect ? (newAttempts === 1 ? 2 : newAttempts === 2 ? 1 : 0) : 0

        const now = Date.now()
        const responseMs = q.startedAt ? now - q.startedAt : 0

        const updatedQuestions = quizSession.questions.map((question, i) =>
          i === quizSession.currentIndex
            ? { ...question, attempts: newAttempts, correct: isCorrect ? true : (showHint ? false : null), pointsEarned: isCorrect ? points : 0, startedAt: question.startedAt || now }
            : question
        )

        const idx = profiles.findIndex(p => p.id === activeProfileId)
        if (idx >= 0) {
          const profile = profiles[idx]
          const sKey = skillKey(q.type, q.type === 'comparison' ? (quizSession.settings.difficulty ?? 'medium') : q.num2)

          // Build skill log entry
          const prevLog = profile.skillLog[sKey] ?? []
          const newEntry: SkillAttempt = { correct: isCorrect, timestamp: new Date().toISOString(), responseTimeMs: responseMs }
          const newSkillLog = { ...profile.skillLog, [sKey]: [...prevLog.slice(-19), newEntry] }

          // Weak area tracking
          const areaPrefix = { multiplication: 'mult', division: 'div', remainder: 'rem', addition: 'add', subtraction: 'sub', comparison: 'cmp' }[q.type]
          const areaKey = `${areaPrefix}_${q.type === 'comparison' ? (quizSession.settings.difficulty || 'medium') : q.num2}`
          const weakAreas = { ...profile.weakAreas }
          if (!isCorrect && newAttempts === 1) weakAreas[areaKey] = (weakAreas[areaKey] || 0) + 1
          else if (isCorrect && weakAreas[areaKey]) weakAreas[areaKey] = Math.max(0, weakAreas[areaKey] - 1)

          const typePrefix = q.type as string
          const correctKey = `${typePrefix}Correct` as keyof typeof profile.stats
          const answerStreak = isCorrect ? profile.stats.answerStreak + 1 : 0

          const newProfiles = [...profiles]
          newProfiles[idx] = {
            ...profile,
            points: profile.points + points,
            weakAreas,
            skillLog: newSkillLog,
            stats: {
              ...profile.stats,
              ...(isCorrect ? { [correctKey]: (profile.stats[correctKey as keyof typeof profile.stats] as number) + 1 } : {}),
              answerStreak,
              maxAnswerStreak: Math.max(profile.stats.maxAnswerStreak, answerStreak),
            },
          }
          set({ profiles: newProfiles })
        }

        set({ quizSession: { ...quizSession, questions: updatedQuestions } })
        return { correct: isCorrect, points, showHint }
      },

      nextQuestion: () => {
        const { quizSession } = get()
        const next = quizSession.currentIndex + 1
        const updatedQuestions = quizSession.questions.map((q, i) =>
          i === next ? { ...q, startedAt: Date.now() } : q
        )
        set({ quizSession: { ...quizSession, questions: updatedQuestions, currentIndex: next } })
      },

      endQuiz: () => {
        const { quizSession, profiles, activeProfileId } = get()
        const idx = profiles.findIndex(p => p.id === activeProfileId)
        if (idx < 0) return

        const profile = profiles[idx]
        const correct = quizSession.questions.filter(q => q.correct === true).length
        const totalPoints = quizSession.questions.reduce((s, q) => s + q.pointsEarned, 0)
        const durationMs = Date.now() - quizSession.startTime
        const mod = quizSession.settings.module
        const totalKey = `${mod}Total` as keyof typeof profile.stats

        const entry: HistoryEntry = {
          date: new Date().toISOString(),
          module: mod,
          score: correct,
          total: quizSession.questions.length,
          points: totalPoints,
          durationMs,
        }

        const scorePercent = Math.round((correct / quizSession.questions.length) * 100)
        const streakUpdate = updateStreak(profile)

        // Salwah progress
        let salwahProgress = profile.salwahProgress
        const { settings } = quizSession
        if (settings.adaptive && mod === 'multiplication' && settings.tables?.length === 1) {
          const table = settings.tables[0]
          const newScores = { ...salwahProgress.tableScores, [table]: scorePercent }
          let newCurrent = salwahProgress.currentTable
          let newUnlocked = [...salwahProgress.unlocked]
          if (scorePercent >= 90 && table === newCurrent && table < 10) {
            const next = table + 1
            if (!newUnlocked.includes(next)) newUnlocked.push(next)
            newCurrent = next
            get().awardBadge(activeProfileId!, `master_${table}`)
          } else if (scorePercent < 70 && table === newCurrent && table > 2) {
            newCurrent = table - 1
          }
          salwahProgress = { currentTable: newCurrent, tableScores: newScores, unlocked: newUnlocked }
        }

        const newProfiles = [...profiles]
        newProfiles[idx] = {
          ...profile,
          ...streakUpdate,
          salwahProgress,
          history: [entry, ...profile.history.slice(0, 99)],
          stats: {
            ...profile.stats,
            [totalKey]: (profile.stats[totalKey as keyof typeof profile.stats] as number) + quizSession.questions.length,
            totalLearningMs: (profile.stats.totalLearningMs || 0) + durationMs,
          },
        }

        set({ profiles: newProfiles, quizSession: { ...quizSession, active: false } })
        get().checkAchievements(activeProfileId!)
      },

      awardBadge: (profileId, badge) => {
        const { profiles } = get()
        const idx = profiles.findIndex(p => p.id === profileId)
        if (idx < 0 || profiles[idx].badges.includes(badge)) return
        const newProfiles = [...profiles]
        newProfiles[idx] = { ...profiles[idx], badges: [...profiles[idx].badges, badge] }
        set({ profiles: newProfiles })
      },

      checkAchievements: (profileId) => {
        const { profiles } = get()
        const profile = profiles.find(p => p.id === profileId)
        if (!profile) return

        const achievements = [...profile.achievements]
        const { stats } = profile
        const totalCorrect = stats.multiplicationCorrect + stats.divisionCorrect + stats.remainderCorrect + stats.additionCorrect + stats.subtractionCorrect + stats.comparisonCorrect

        const check = (key: string, condition: boolean) => { if (!achievements.includes(key) && condition) achievements.push(key) }

        check('first_quiz', profile.history.length >= 1)
        check('first_correct', totalCorrect >= 1)
        check('streak_10', stats.maxAnswerStreak >= 10)
        check('streak_50', stats.maxAnswerStreak >= 50)
        check('streak_100', stats.maxAnswerStreak >= 100)
        check('correct_50', totalCorrect >= 50)
        check('correct_100', totalCorrect >= 100)
        check('correct_500', totalCorrect >= 500)
        check('daily_streak_7', profile.dailyStreak >= 7)
        check('daily_streak_30', profile.dailyStreak >= 30)
        check('perfect_quiz', profile.history.some(h => h.score === h.total && h.total >= 10))
        check('mult_master', stats.multiplicationTotal >= 50 && stats.multiplicationCorrect / Math.max(1, stats.multiplicationTotal) >= 0.9)
        check('div_master', stats.divisionTotal >= 50 && stats.divisionCorrect / Math.max(1, stats.divisionTotal) >= 0.9)
        check('add_master', stats.additionTotal >= 50 && stats.additionCorrect / Math.max(1, stats.additionTotal) >= 0.9)
        check('sub_master', stats.subtractionTotal >= 50 && stats.subtractionCorrect / Math.max(1, stats.subtractionTotal) >= 0.9)
        check('cmp_master', stats.comparisonTotal >= 30 && stats.comparisonCorrect / Math.max(1, stats.comparisonTotal) >= 0.9)

        const idx = profiles.findIndex(p => p.id === profileId)
        if (achievements.length !== profile.achievements.length) {
          const newProfiles = [...profiles]
          newProfiles[idx] = { ...profile, achievements }
          set({ profiles: newProfiles })
        }
      },
    }),
    {
      name: 'kids-math-store-v2',
      // merge persisted state with defaults so old profiles get new fields
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<GameState> & { profiles?: Partial<Profile>[] }
        if (!p?.profiles) return current
        return {
          ...current,
          ...(p as Partial<GameState>),
          profiles: (p.profiles || []).map(old => ({
            ...defaultProfile(old.name || '', old.avatar || '🦁'),
            ...old,
            stats: { ...defaultProfile('', '').stats, ...(old.stats || {}) },
            skillLog: old.skillLog || {},
            dailyStreak: old.dailyStreak ?? 0,
            lastActivityDate: old.lastActivityDate ?? null,
          })) as Profile[],
        }
      },
    }
  )
)

// ─── Computed helpers (used in components) ────────────────────────────────────

export function weeklyPoints(profile: Profile): number {
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()
  return profile.history.filter(h => h.date >= cutoff).reduce((s, h) => s + h.points, 0)
}

export function monthlyPoints(profile: Profile): number {
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
  return profile.history.filter(h => h.date >= cutoff).reduce((s, h) => s + h.points, 0)
}

export function dailyPointsLast7(profile: Profile): { day: string; pts: number }[] {
  const result: { day: string; pts: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dayStr = d.toISOString().slice(0, 10)
    const pts = profile.history.filter(h => h.date.startsWith(dayStr)).reduce((s, h) => s + h.points, 0)
    result.push({ day: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][d.getDay()], pts })
  }
  return result
}

export function avgResponseTime(profile: Profile, module?: ModuleType): number {
  const logs = Object.entries(profile.skillLog)
    .filter(([key]) => !module || key.startsWith({ multiplication: 'mult', division: 'div', remainder: 'rem', addition: 'add', subtraction: 'sub', comparison: 'cmp' }[module] || ''))
    .flatMap(([, attempts]) => attempts)
    .map(a => a.responseTimeMs)
    .filter(t => t > 0)
  if (!logs.length) return 0
  return Math.round(logs.reduce((s, t) => s + t, 0) / logs.length / 1000)
}
