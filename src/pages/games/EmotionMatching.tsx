import { useState, useCallback } from 'react'
import { addStars } from '../../store/rewards'
import '../Games.css'
import './EmotionMatching.css'

interface Props { onBack: () => void }

export interface EmotionItem {
  emoji: string
  name: string
}

export const EMOTIONS: EmotionItem[] = [
  { emoji: '😊', name: 'Happy'    },
  { emoji: '😢', name: 'Sad'      },
  { emoji: '😡', name: 'Angry'    },
  { emoji: '😨', name: 'Scared'   },
  { emoji: '😲', name: 'Surprised'},
  { emoji: '😴', name: 'Sleepy'   },
  { emoji: '🤢', name: 'Sick'     },
  { emoji: '😍', name: 'Loving'   },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function buildRound(emotions: EmotionItem[] = EMOTIONS) {
  const shuffled = shuffle(emotions)
  const correct = shuffled[0]
  const choices = shuffle([correct, ...shuffled.slice(1, 4)])
  return { correct, choices }
}

export default function EmotionMatching({ onBack }: Props) {
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [total] = useState(8)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [done, setDone] = useState(false)
  const [{ correct, choices }, setRoundData] = useState(() => buildRound())
  const [selected, setSelected] = useState<string | null>(null)

  const handleChoice = useCallback((name: string) => {
    if (feedback) return
    setSelected(name)
    const isCorrect = name === correct.name
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (round >= total) {
        const finalScore = isCorrect ? score + 1 : score
        addStars(finalScore >= total * 0.75 ? 2 : 1)
        setDone(true)
      } else {
        setRound(r => r + 1)
        setRoundData(buildRound())
        setFeedback(null)
        setSelected(null)
      }
    }, 900)
  }, [feedback, correct.name, round, total, score])

  const restart = () => {
    setScore(0)
    setRound(1)
    setDone(false)
    setFeedback(null)
    setSelected(null)
    setRoundData(buildRound())
  }

  if (done) {
    return (
      <div className="game-container">
        <div className="game-result">
          <div style={{ fontSize: '4rem' }}>{score >= total * 0.75 ? '🎉' : '👏'}</div>
          <h2>Game Over!</h2>
          <p>You matched <strong>{score}</strong> out of <strong>{total}</strong> emotions correctly.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>⭐ Stars awarded!</p>
          <div className="game-result__actions">
            <button className="btn btn-primary" onClick={restart}>Play Again</button>
            <button className="btn btn-outline" onClick={onBack}>Back to Games</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="btn btn-outline" onClick={onBack} aria-label="Back to games">← Back</button>
        <h1>😊 Emotion Matching</h1>
        <div className="game-score">
          <span>Round {round}/{total}</span>
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="em-card card" aria-live="polite">
        <p className="em-prompt">What emotion does this show?</p>
        <div
          className="em-emoji"
          role="img"
          aria-label={`Emoji showing an emotion – choose from the options below`}
        >
          {correct.emoji}
        </div>

        <div
          className={`em-feedback em-feedback--${feedback ?? 'hidden'}`}
          aria-live="assertive"
          role="status"
        >
          {feedback === 'correct' && '✅ Correct!'}
          {feedback === 'wrong'   && `❌ It was "${correct.name}"`}
        </div>

        <div className="em-choices" role="group" aria-label="Emotion choices">
          {choices.map(choice => (
            <button
              key={choice.name}
              className={`em-choice-btn${
                selected === choice.name
                  ? feedback === 'correct'
                    ? ' em-choice-btn--correct'
                    : ' em-choice-btn--wrong'
                  : selected && choice.name === correct.name
                  ? ' em-choice-btn--reveal'
                  : ''
              }`}
              onClick={() => handleChoice(choice.name)}
              disabled={!!feedback}
              aria-pressed={selected === choice.name}
            >
              {choice.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
