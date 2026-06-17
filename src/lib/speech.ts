// Arabic text-to-speech for reading a question aloud, using the
// browser's built-in Web Speech API (no external service).
import type { QuizQuestion } from '@/store/gameStore'

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string) {
  if (!speechSupported()) return
  const synth = window.speechSynthesis
  synth.cancel() // stop anything already speaking
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ar-SA'
  u.rate = 0.9
  u.pitch = 1.05
  // Prefer an Arabic voice if the device has one.
  const arVoice = synth.getVoices().find(v => v.lang.startsWith('ar'))
  if (arVoice) u.voice = arVoice
  synth.speak(u)
}

// Build a natural Arabic sentence from a question (reading the raw
// symbols like "×" aloud sounds bad, so we phrase it as words).
export function buildQuestionSpeech(q: QuizQuestion): string {
  switch (q.type) {
    case 'multiplication': return `كم يساوي ${q.num1} ضرب ${q.num2}؟`
    case 'division':       return `كم يساوي ${q.num1} على ${q.num2}؟`
    case 'remainder':      return `اقسم ${q.num1} على ${q.num2}. ما خارج القسمة والباقي؟`
    case 'addition':       return `كم يساوي ${q.num1} زائد ${q.num2}؟`
    case 'subtraction':    return `كم يساوي ${q.num1} ناقص ${q.num2}؟`
    case 'comparison':     return `قارن بين ${q.num1} و ${q.num2}. اختر أكبر من، أو أصغر من، أو يساوي.`
    default:               return ''
  }
}
