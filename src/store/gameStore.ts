import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  id: string
  name: string
  avatar: string
  points: number
  badges: string[]
  achievements: string[]
  stats: {
    multiplicationCorrect: number
    multiplicationTotal: number
    divisionCorrect: number
    divisionTotal: number
    remainderCorrect: number
    remainderTotal: number
    streak: number
    maxStreak: number
  }
  weakAreas: Record<string, number> // key: "mult_6" or "div_7", value: miss count
  salwahProgress: {
    currentTable: number
    tableScores: Record<number, number>
    unlocked: number[]
  }
  history: HistoryEntry[]
}

export interface HistoryEntry {
  date: string
  module: 'multiplication' | 'division' | 'remainder'
  score: number
  total: number
  points: number
}

export interface QuizQuestion {
  id: string
  type: 'multiplication' | 'division' | 'remainder'
  num1: number
  num2: number
  answer: number
  remainder?: number
  attempts: number
  correct: boolean | null
  pointsEarned: number
  timeSpent: number
}

interface GameState {
  profiles: Profile[]
  activeProfileId: string | null
  currentModule: 'home' | 'multiplication' | 'division' | 'remainder' | 'salwah' | 'dashboard' | 'parent'
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
  setModule: (module: GameState['currentModule']) => void
  startQuiz: (settings: QuizSettings) => void
  answerQuestion: (answer: number, remainder?: number) => { correct: boolean; points: number; showHint: boolean }
  nextQuestion: () => void
  endQuiz: () => void
  awardBadge: (profileId: string, badge: string) => void
  checkAchievements: (profileId: string) => void
}

export interface QuizSettings {
  module: 'multiplication' | 'division' | 'remainder'
  tables?: number[]
  questionCount: 10 | 20 | 30 | 50
  difficulty?: 'easy' | 'medium' | 'hard'
  adaptive?: boolean
}

function generateMultQuestion(tables: number[], difficulty: 'easy' | 'medium' | 'hard', weakAreas: Record<string, number>): QuizQuestion {
  const weightedTables = [...tables]
  tables.forEach(t => {
    const missCount = weakAreas[`mult_${t}`] || 0
    for (let i = 0; i < missCount; i++) weightedTables.push(t)
  })

  const table = weightedTables[Math.floor(Math.random() * weightedTables.length)]
  const maxMultiplier = difficulty === 'easy' ? 5 : 10
  const multiplier = Math.floor(Math.random() * maxMultiplier) + 1

  return {
    id: Math.random().toString(36).slice(2),
    type: 'multiplication',
    num1: table,
    num2: multiplier,
    answer: table * multiplier,
    attempts: 0,
    correct: null,
    pointsEarned: 0,
    timeSpent: 0,
  }
}

function generateDivQuestion(tables: number[], weakAreas: Record<string, number>): QuizQuestion {
  const weightedTables = [...tables]
  tables.forEach(t => {
    const missCount = weakAreas[`div_${t}`] || 0
    for (let i = 0; i < missCount; i++) weightedTables.push(t)
  })

  const divisor = weightedTables[Math.floor(Math.random() * weightedTables.length)]
  const quotient = Math.floor(Math.random() * 10) + 1
  const dividend = divisor * quotient

  return {
    id: Math.random().toString(36).slice(2),
    type: 'division',
    num1: dividend,
    num2: divisor,
    answer: quotient,
    attempts: 0,
    correct: null,
    pointsEarned: 0,
    timeSpent: 0,
  }
}

function generateRemainderQuestion(tables: number[], weakAreas: Record<string, number>): QuizQuestion {
  const weightedTables = [...tables]
  tables.forEach(t => {
    const missCount = weakAreas[`rem_${t}`] || 0
    for (let i = 0; i < missCount; i++) weightedTables.push(t)
  })

  const divisor = weightedTables[Math.floor(Math.random() * weightedTables.length)]
  const quotient = Math.floor(Math.random() * 10) + 1
  const remainder = Math.floor(Math.random() * (divisor - 1)) + 1
  const dividend = divisor * quotient + remainder

  return {
    id: Math.random().toString(36).slice(2),
    type: 'remainder',
    num1: dividend,
    num2: divisor,
    answer: quotient,
    remainder,
    attempts: 0,
    correct: null,
    pointsEarned: 0,
    timeSpent: 0,
  }
}

function generateQuestions(settings: QuizSettings, weakAreas: Record<string, number>): QuizQuestion[] {
  const tables = settings.tables?.length ? settings.tables : Array.from({ length: 10 }, (_, i) => i + 1)
  const questions: QuizQuestion[] = []

  for (let i = 0; i < settings.questionCount; i++) {
    if (settings.module === 'multiplication') {
      questions.push(generateMultQuestion(tables, settings.difficulty || 'medium', weakAreas))
    } else if (settings.module === 'division') {
      questions.push(generateDivQuestion(tables, weakAreas))
    } else {
      questions.push(generateRemainderQuestion(tables, weakAreas))
    }
  }
  return questions
}

const defaultProfile = (name: string, avatar: string): Profile => ({
  id: Math.random().toString(36).slice(2),
  name,
  avatar,
  points: 0,
  badges: [],
  achievements: [],
  stats: {
    multiplicationCorrect: 0,
    multiplicationTotal: 0,
    divisionCorrect: 0,
    divisionTotal: 0,
    remainderCorrect: 0,
    remainderTotal: 0,
    streak: 0,
    maxStreak: 0,
  },
  weakAreas: {},
  salwahProgress: {
    currentTable: 2,
    tableScores: {},
    unlocked: [2],
  },
  history: [],
})

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      currentModule: 'home',
      quizSession: {
        active: false,
        questions: [],
        currentIndex: 0,
        startTime: 0,
        settings: { module: 'multiplication', questionCount: 10 },
      },

      activeProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find(p => p.id === activeProfileId) || null
      },

      setActiveProfile: (id) => set({ activeProfileId: id, currentModule: 'home' }),

      addProfile: (name, avatar) => {
        const profile = defaultProfile(name, avatar)
        set(state => ({ profiles: [...state.profiles, profile], activeProfileId: profile.id }))
      },

      setModule: (module) => set({ currentModule: module }),

      startQuiz: (settings) => {
        const profile = get().activeProfile()
        const weakAreas = profile?.weakAreas || {}
        const questions = generateQuestions(settings, weakAreas)
        set({
          quizSession: {
            active: true,
            questions,
            currentIndex: 0,
            startTime: Date.now(),
            settings,
          },
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
        let points = 0

        if (isCorrect) {
          points = newAttempts === 1 ? 2 : newAttempts === 2 ? 1 : 0
        }

        const updatedQuestions = quizSession.questions.map((question, i) =>
          i === quizSession.currentIndex
            ? { ...question, attempts: newAttempts, correct: isCorrect ? true : (showHint && !isCorrect ? false : null), pointsEarned: isCorrect ? points : 0 }
            : question
        )

        // Update profile stats and weak areas
        const profileIndex = profiles.findIndex(p => p.id === activeProfileId)
        if (profileIndex >= 0) {
          const profile = profiles[profileIndex]
          const newProfiles = [...profiles]
          const correctStatKey = `${q.type === 'multiplication' ? 'multiplication' : q.type === 'division' ? 'division' : 'remainder'}Correct` as keyof typeof profile.stats
          const areaKey = `${q.type === 'remainder' ? 'rem' : q.type === 'multiplication' ? 'mult' : 'div'}_${q.num2}`
          const weakAreas = { ...profile.weakAreas }

          if (!isCorrect && newAttempts === 1) {
            weakAreas[areaKey] = (weakAreas[areaKey] || 0) + 1
          } else if (isCorrect && weakAreas[areaKey]) {
            weakAreas[areaKey] = Math.max(0, weakAreas[areaKey] - 1)
          }

          const newStreak = isCorrect ? profile.stats.streak + 1 : 0
          newProfiles[profileIndex] = {
            ...profile,
            points: profile.points + points,
            weakAreas,
            stats: {
              ...profile.stats,
              ...(isCorrect ? { [correctStatKey]: (profile.stats[correctStatKey as keyof typeof profile.stats] as number) + 1 } : {}),
              streak: newStreak,
              maxStreak: Math.max(profile.stats.maxStreak, newStreak),
            },
          }
          set({ profiles: newProfiles })
        }

        set({ quizSession: { ...quizSession, questions: updatedQuestions } })
        return { correct: isCorrect, points, showHint }
      },

      nextQuestion: () => {
        const { quizSession } = get()
        set({
          quizSession: {
            ...quizSession,
            currentIndex: quizSession.currentIndex + 1,
          },
        })
      },

      endQuiz: () => {
        const { quizSession, profiles, activeProfileId } = get()
        const profileIndex = profiles.findIndex(p => p.id === activeProfileId)
        if (profileIndex < 0) return

        const profile = profiles[profileIndex]
        const correct = quizSession.questions.filter(q => q.correct === true).length
        const totalPoints = quizSession.questions.reduce((sum, q) => sum + q.pointsEarned, 0)

        const moduleKey = quizSession.settings.module
        const statKey = `${moduleKey}Total` as 'multiplicationTotal' | 'divisionTotal' | 'remainderTotal'

        const entry: HistoryEntry = {
          date: new Date().toISOString(),
          module: moduleKey,
          score: correct,
          total: quizSession.questions.length,
          points: totalPoints,
        }

        const scorePercent = Math.round((correct / quizSession.questions.length) * 100)

        // Update Salwah progress if this was a Salwah/adaptive quiz on multiplication
        let salwahProgress = profile.salwahProgress
        const settings = quizSession.settings
        if (settings.adaptive && settings.module === 'multiplication' && settings.tables?.length === 1) {
          const table = settings.tables[0]
          const newScores = { ...salwahProgress.tableScores, [table]: scorePercent }
          let newCurrentTable = salwahProgress.currentTable
          let newUnlocked = [...salwahProgress.unlocked]

          if (scorePercent >= 90 && table === salwahProgress.currentTable && table < 10) {
            const next = table + 1
            if (!newUnlocked.includes(next)) newUnlocked.push(next)
            newCurrentTable = next
            // Award badge
            get().awardBadge(activeProfileId!, `master_${table}`)
          } else if (scorePercent < 70 && table === salwahProgress.currentTable && table > 2) {
            newCurrentTable = table - 1
          }
          salwahProgress = { currentTable: newCurrentTable, tableScores: newScores, unlocked: newUnlocked }
        }

        const newProfiles = [...profiles]
        newProfiles[profileIndex] = {
          ...profile,
          salwahProgress,
          history: [entry, ...profile.history.slice(0, 49)],
          stats: {
            ...profile.stats,
            [statKey]: profile.stats[statKey] + quizSession.questions.length,
          },
        }

        set({
          profiles: newProfiles,
          quizSession: { ...quizSession, active: false },
        })

        get().checkAchievements(activeProfileId!)
      },

      awardBadge: (profileId, badge) => {
        const { profiles } = get()
        const idx = profiles.findIndex(p => p.id === profileId)
        if (idx < 0) return
        if (profiles[idx].badges.includes(badge)) return
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

        const totalCorrect = stats.multiplicationCorrect + stats.divisionCorrect + stats.remainderCorrect

        if (!achievements.includes('first_quiz') && profile.history.length >= 1) {
          achievements.push('first_quiz')
        }
        if (!achievements.includes('streak_10') && stats.maxStreak >= 10) {
          achievements.push('streak_10')
        }
        if (!achievements.includes('streak_50') && stats.maxStreak >= 50) {
          achievements.push('streak_50')
        }
        if (!achievements.includes('streak_100') && stats.maxStreak >= 100) {
          achievements.push('streak_100')
        }
        if (!achievements.includes('correct_100') && totalCorrect >= 100) {
          achievements.push('correct_100')
        }

        const idx = profiles.findIndex(p => p.id === profileId)
        if (achievements.length !== profile.achievements.length) {
          const newProfiles = [...profiles]
          newProfiles[idx] = { ...profile, achievements }
          set({ profiles: newProfiles })
        }
      },
    }),
    { name: 'kids-math-store' }
  )
)
