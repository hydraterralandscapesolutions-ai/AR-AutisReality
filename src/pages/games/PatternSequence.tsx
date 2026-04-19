import { useState, useEffect, useCallback, useRef } from 'react'
import { addStars } from '../../store/rewards'
import '../Games.css'
import './PatternSequence.css'

interface Props { onBack: () => void }

const COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6']
const COLOR_NAMES = ['Red','Blue','Green','Yellow','Purple']

function genSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * COLORS.length))
}

type Phase = 'showing' | 'input' | 'success' | 'fail' | 'done'

export default function PatternSequence({ onBack }: Props) {
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState<number[]>(() => genSequence(2))
  const [showIdx, setShowIdx] = useState<number>(-1)
  const [phase, setPhase] = useState<Phase>('showing')
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [wins, setWins] = useState(0)
  const [totalRounds] = useState(5)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  const playSequence = useCallback((seq: number[]) => {
    setPhase('showing')
    setShowIdx(-1)
    let delay = 600
    seq.forEach((_, i) => {
      const t1 = setTimeout(() => setShowIdx(i), delay)
      const t2 = setTimeout(() => setShowIdx(-1), delay + 500)
      timeouts.current.push(t1, t2)
      delay += 900
    })
    const tEnd = setTimeout(() => {
      setShowIdx(-1)
      setPhase('input')
      setPlayerInput([])
    }, delay + 200)
    timeouts.current.push(tEnd)
  }, [])

  // Start sequence on mount and level change
  useEffect(() => {
    clearTimeouts()
    playSequence(sequence)
    return clearTimeouts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence])

  const handleBlockClick = useCallback((colorIdx: number) => {
    if (phase !== 'input') return
    const newInput = [...playerInput, colorIdx]
    setPlayerInput(newInput)

    const pos = newInput.length - 1
    if (newInput[pos] !== sequence[pos]) {
      setPhase('fail')
      return
    }

    if (newInput.length === sequence.length) {
      const newWins = wins + 1
      setWins(newWins)
      if (newWins >= totalRounds) {
        addStars(2)
        setPhase('done')
      } else {
        setPhase('success')
      }
    }
  }, [phase, playerInput, sequence, wins, totalRounds])

  const nextLevel = useCallback(() => {
    const newLevel = level + 1
    setLevel(newLevel)
    const newSeq = genSequence(2 + newLevel)
    setSequence(newSeq)
  }, [level])

  const retry = useCallback(() => {
    clearTimeouts()
    setPlayerInput([])
    playSequence(sequence)
  }, [sequence, playSequence])

  const restart = () => {
    clearTimeouts()
    setLevel(1)
    setWins(0)
    const newSeq = genSequence(2)
    setSequence(newSeq)
  }

  if (phase === 'done') {
    return (
      <div className="game-container">
        <div className="game-result">
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h2>You're a Pattern Pro!</h2>
          <p>You completed all {totalRounds} rounds. Level reached: {level}</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>⭐⭐ 2 Stars awarded!</p>
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
        <h1>🎨 Pattern Sequence</h1>
        <div className="game-score">
          <span>Level {level}</span>
          <span>Wins: {wins}/{totalRounds}</span>
        </div>
      </div>

      <div className="ps-card card" aria-live="polite">
        {phase === 'showing' && (
          <p className="ps-status ps-status--watch" role="status">👀 Watch the sequence!</p>
        )}
        {phase === 'input' && (
          <p className="ps-status ps-status--go" role="status">🖱 Your turn! Repeat the sequence.</p>
        )}
        {phase === 'success' && (
          <p className="ps-status ps-status--correct" role="status">✅ Correct! Get ready for next level…</p>
        )}
        {phase === 'fail' && (
          <p className="ps-status ps-status--fail" role="status">❌ Oops! Try again.</p>
        )}

        {/* Sequence display blocks */}
        <div className="ps-sequence" aria-label="Pattern sequence" role="group">
          {sequence.map((colorIdx, i) => (
            <div
              key={i}
              className={`ps-block${showIdx === i ? ' ps-block--lit' : ''}`}
              style={{ background: COLORS[colorIdx] }}
              aria-label={`Block ${i + 1}: ${COLOR_NAMES[colorIdx]}`}
              aria-hidden={phase !== 'showing'}
            />
          ))}
        </div>

        <p className="ps-progress">
          Progress: {playerInput.length}/{sequence.length}
        </p>

        {/* Input buttons */}
        <div
          className="ps-buttons"
          role="group"
          aria-label="Color buttons to repeat sequence"
        >
          {COLORS.map((color, idx) => (
            <button
              key={idx}
              className="ps-color-btn"
              style={{ background: color }}
              onClick={() => handleBlockClick(idx)}
              disabled={phase !== 'input'}
              aria-label={`${COLOR_NAMES[idx]} block`}
            />
          ))}
        </div>

        {phase === 'fail' && (
          <div className="ps-actions">
            <button className="btn btn-primary" onClick={retry}>Try Again</button>
          </div>
        )}
        {phase === 'success' && (
          <div className="ps-actions">
            <button className="btn btn-primary" onClick={nextLevel}>Next Level →</button>
          </div>
        )}
      </div>
    </div>
  )
}
