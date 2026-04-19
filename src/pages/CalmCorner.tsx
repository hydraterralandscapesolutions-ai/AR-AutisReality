import { useState, useEffect, useCallback } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import './CalmCorner.css'

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale'

const PHASE_DURATION: Record<BreathPhase, number> = {
  idle:   0,
  inhale: 4,
  hold:   4,
  exhale: 6,
}

const MOODS = [
  { emoji: '😊', label: 'Happy',    color: '#fef3c7' },
  { emoji: '😢', label: 'Sad',      color: '#dbeafe' },
  { emoji: '😡', label: 'Angry',    color: '#fee2e2' },
  { emoji: '😨', label: 'Anxious',  color: '#ede9fe' },
  { emoji: '😴', label: 'Tired',    color: '#e0f2fe' },
  { emoji: '😌', label: 'Calm',     color: '#d1fae5' },
]

const TIPS = [
  '🌿 Take a slow walk outside and notice 5 things you can see.',
  '🎵 Listen to your favourite calming music or nature sounds.',
  '✏️ Draw or doodle how you are feeling right now.',
  '🤗 Give someone you love a gentle hug.',
  '💧 Drink a glass of cool water slowly.',
  '🌈 Think of 3 things you are grateful for today.',
  '🐢 Move slowly and mindfully – like a turtle!',
]

export default function CalmCorner() {
  usePageTitle('Calm Corner')

  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle')
  const [breathRunning, setBreathRunning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [moodLog, setMoodLog] = useState<{ emoji: string; label: string; time: string }[]>([])
  const [tipIdx, setTipIdx] = useState(0)

  const nextPhase = useCallback((current: BreathPhase): BreathPhase => {
    if (current === 'inhale') return 'hold'
    if (current === 'hold')   return 'exhale'
    return 'inhale'
  }, [])

  useEffect(() => {
    if (!breathRunning) return

    const phase = breathPhase === 'idle' ? 'inhale' : breathPhase
    if (breathPhase === 'idle') {
      setBreathPhase('inhale')
      setCountdown(PHASE_DURATION.inhale)
      return
    }

    if (countdown <= 0) {
      const np = nextPhase(phase)
      setBreathPhase(np)
      setCountdown(PHASE_DURATION[np])
      return
    }

    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [breathRunning, breathPhase, countdown, nextPhase])

  const startBreathing = () => {
    setBreathRunning(true)
    setBreathPhase('idle')
    setCountdown(0)
  }

  const stopBreathing = () => {
    setBreathRunning(false)
    setBreathPhase('idle')
    setCountdown(0)
  }

  const logMood = (emoji: string, label: string) => {
    setSelectedMood(label)
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMoodLog(prev => [{ emoji, label, time }, ...prev].slice(0, 5))
  }

  const phaseLabel: Record<BreathPhase, string> = {
    idle:   'Press Start',
    inhale: 'Breathe In…',
    hold:   'Hold…',
    exhale: 'Breathe Out…',
  }

  return (
    <div className="page">
      <h1 className="page-title">🌿 Calm Corner</h1>
      <p className="page-subtitle">
        A peaceful space for breathing exercises, mood check-ins, and calming activities.
      </p>

      <div className="calm-grid">
        {/* Breathing exercise */}
        <section className="calm-card card" aria-labelledby="breathing-heading">
          <h2 id="breathing-heading" className="calm-card__title">🫁 Breathing Exercise</h2>
          <p className="calm-card__desc">Follow the circle to calm your mind.</p>

          <div
            className="breath-circle-wrap"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Breathing exercise: ${phaseLabel[breathPhase]}${breathRunning && countdown > 0 ? `, ${countdown} seconds` : ''}`}
          >
            <div className={`breath-circle breath-circle--${breathPhase}`} aria-hidden="true">
              <span className="breath-circle__label">{phaseLabel[breathPhase]}</span>
              {breathRunning && countdown > 0 && (
                <span className="breath-circle__count">{countdown}s</span>
              )}
            </div>
          </div>

          <div className="breath-controls">
            {!breathRunning ? (
              <button className="btn btn-primary" onClick={startBreathing}>
                ▶ Start Breathing
              </button>
            ) : (
              <button className="btn btn-outline" onClick={stopBreathing}>
                ⏹ Stop
              </button>
            )}
          </div>

          <p className="breath-guide">
            Inhale 4s · Hold 4s · Exhale 6s
          </p>
        </section>

        {/* Mood logger */}
        <section className="calm-card card" aria-labelledby="mood-heading">
          <h2 id="mood-heading" className="calm-card__title">🎨 Mood Check-In</h2>
          <p className="calm-card__desc">How are you feeling right now?</p>

          <div className="mood-grid" role="group" aria-label="Mood selection">
            {MOODS.map(mood => (
              <button
                key={mood.label}
                className={`mood-btn${selectedMood === mood.label ? ' mood-btn--selected' : ''}`}
                style={{ '--mood-bg': mood.color } as React.CSSProperties}
                onClick={() => logMood(mood.emoji, mood.label)}
                aria-pressed={selectedMood === mood.label}
                aria-label={`Log mood: ${mood.label}`}
              >
                <span className="mood-btn__emoji">{mood.emoji}</span>
                <span className="mood-btn__label">{mood.label}</span>
              </button>
            ))}
          </div>

          {moodLog.length > 0 && (
            <div className="mood-log" aria-label="Recent mood log" aria-live="polite">
              <p className="mood-log__title">Recent check-ins:</p>
              <ul>
                {moodLog.map((entry, i) => (
                  <li key={i}>
                    {entry.emoji} {entry.label} <span className="mood-log__time">at {entry.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Calming tips */}
        <section className="calm-card calm-card--wide card" aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="calm-card__title">💡 Calming Tips</h2>
          <p className="calm-card__desc">A little idea to help you feel better.</p>

          <blockquote className="calm-tip">
            {TIPS[tipIdx]}
          </blockquote>

          <button
            className="btn btn-outline"
            onClick={() => setTipIdx(i => (i + 1) % TIPS.length)}
            aria-label="Show next calming tip"
          >
            Next Tip →
          </button>
        </section>
      </div>
    </div>
  )
}
