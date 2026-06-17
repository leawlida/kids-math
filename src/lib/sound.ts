// Simple Web Audio sound effects — no external asset files.
// The AudioContext is created lazily on first use so iOS unlocks it
// inside a user gesture (a tap), which is required for audio to play.

type SoundName = 'correct' | 'wrong' | 'click'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.18) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  g.gain.setValueAtTime(0.0001, ac.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + duration + 0.02)
}

export function playSound(name: SoundName) {
  switch (name) {
    case 'correct':
      // cheerful rising arpeggio
      tone(523.25, 0, 0.18)    // C5
      tone(659.25, 0.12, 0.18) // E5
      tone(783.99, 0.24, 0.28) // G5
      break
    case 'wrong':
      // gentle low "uh-oh" — not harsh for kids
      tone(311.13, 0, 0.18, 'triangle', 0.16) // Eb4
      tone(233.08, 0.16, 0.3, 'triangle', 0.16) // Bb3
      break
    case 'click':
      tone(660, 0, 0.06, 'square', 0.08)
      break
  }
}

// Call inside a user gesture to unlock audio on iOS.
export function unlockAudio() {
  getCtx()
}
