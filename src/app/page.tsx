'use client'
import { useGameStore } from '@/store/gameStore'
import { ProfileSelect } from '@/components/ProfileSelect'
import { HomeScreen } from '@/components/HomeScreen'
import { MultiplicationLearn } from '@/components/MultiplicationLearn'
import { DivisionLearn } from '@/components/DivisionLearn'
import { AdditionLearn } from '@/components/AdditionLearn'
import { SubtractionLearn } from '@/components/SubtractionLearn'
import { ComparisonLearn } from '@/components/ComparisonLearn'
import { SalwahMode } from '@/components/SalwahMode'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Settings } from '@/components/Settings'
import { QuizEngine } from '@/components/quiz/QuizEngine'

export default function Page() {
  const activeProfileId = useGameStore(s => s.activeProfileId)
  const currentModule = useGameStore(s => s.currentModule)
  const quizActive = useGameStore(s => s.quizSession.active)

  if (!activeProfileId) return <ProfileSelect />
  if (quizActive) return <QuizEngine />

  switch (currentModule) {
    case 'multiplication': return <MultiplicationLearn />
    case 'division':       return <DivisionLearn withRemainder={false} />
    case 'remainder':      return <DivisionLearn withRemainder={true} />
    case 'addition':       return <AdditionLearn />
    case 'subtraction':    return <SubtractionLearn />
    case 'comparison':     return <ComparisonLearn />
    case 'salwah':         return <SalwahMode />
    case 'dashboard':      return <Dashboard />
    case 'parent':         return <Settings />
    default:               return <HomeScreen />
  }
}
