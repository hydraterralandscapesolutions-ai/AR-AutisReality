import { useState, useCallback } from 'react'
import { addStars } from '../../store/rewards'
import '../Games.css'
import './ShapeSorter.css'

interface Props { onBack: () => void }

interface Shape {
  id: string
  shape: 'circle' | 'square' | 'triangle' | 'star'
  color: string
  colorName: string
}

const SHAPES: Shape[] = [
  { id: 'red-circle',   shape: 'circle',   color: '#ef4444', colorName: 'Red'    },
  { id: 'blue-square',  shape: 'square',   color: '#3b82f6', colorName: 'Blue'   },
  { id: 'green-tri',    shape: 'triangle', color: '#22c55e', colorName: 'Green'  },
  { id: 'yellow-star',  shape: 'star',     color: '#f59e0b', colorName: 'Yellow' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

type SlotState = 'empty' | 'correct' | 'wrong'

export default function ShapeSorter({ onBack }: Props) {
  const [pieces, setPieces] = useState<Shape[]>(() => shuffle(SHAPES))
  const [slots, setSlots] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(SHAPES.map(s => [s.id, null]))
  )
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(() =>
    Object.fromEntries(SHAPES.map(s => [s.id, 'empty']))
  )
  const [dragging, setDragging] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)

  // Pointer-event based drag
  const handleDragStart = (id: string) => setDragging(id)
  const handleDragEnd   = () => { setDragging(null); setDragOverSlot(null) }

  const handleDrop = useCallback((targetSlotId: string) => {
    if (!dragging) return
    setDragOverSlot(null)

    const isCorrect = dragging === targetSlotId

    setSlots(prev => ({ ...prev, [targetSlotId]: dragging }))
    setSlotStates(prev => ({ ...prev, [targetSlotId]: isCorrect ? 'correct' : 'wrong' }))

    if (isCorrect) {
      setPieces(prev => prev.filter(p => p.id !== dragging))
      const newScore = score + 1
      setScore(newScore)
      if (newScore === SHAPES.length) {
        addStars(2)
        setTimeout(() => setDone(true), 600)
      }
    } else {
      // flash wrong, then clear slot
      setTimeout(() => {
        setSlots(prev => ({ ...prev, [targetSlotId]: null }))
        setSlotStates(prev => ({ ...prev, [targetSlotId]: 'empty' }))
      }, 700)
    }
    setDragging(null)
  }, [dragging, score])

  const restart = () => {
    setPieces(shuffle(SHAPES))
    setSlots(Object.fromEntries(SHAPES.map(s => [s.id, null])))
    setSlotStates(Object.fromEntries(SHAPES.map(s => [s.id, 'empty'])))
    setDone(false)
    setScore(0)
    setDragging(null)
  }

  if (done) {
    return (
      <div className="game-container">
        <div className="game-result">
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h2>All Shapes Sorted!</h2>
          <p>You matched all {SHAPES.length} shapes to their outlines!</p>
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
        <h1>🔷 Shape Sorter</h1>
        <div className="game-score">
          <span>Matched: {score}/{SHAPES.length}</span>
        </div>
      </div>

      <div className="ss-card card">
        <p className="ss-instructions">
          Drag each shape and drop it onto the matching outline below.
        </p>

        {/* Draggable pieces */}
        <div className="ss-pieces" role="group" aria-label="Shapes to sort">
          {pieces.map(piece => (
            <div
              key={piece.id}
              className={`ss-piece${dragging === piece.id ? ' ss-piece--dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(piece.id)}
              onDragEnd={handleDragEnd}
              role="button"
              tabIndex={0}
              aria-label={`${piece.colorName} ${piece.shape} – drag to matching slot`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleDragStart(piece.id)
              }}
            >
              <ShapeIcon shape={piece.shape} color={piece.color} size={56} />
            </div>
          ))}
          {pieces.length === 0 && (
            <p className="ss-done-msg" aria-live="polite">All shapes sorted! 🎉</p>
          )}
        </div>

        {/* Drop slots */}
        <div className="ss-slots" role="group" aria-label="Shape outline slots">
          {SHAPES.map(shape => (
            <div
              key={shape.id}
              className={`ss-slot ss-slot--${slotStates[shape.id]}${dragOverSlot === shape.id ? ' ss-slot--hover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOverSlot(shape.id) }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={() => handleDrop(shape.id)}
              aria-label={`${shape.colorName} ${shape.shape} slot`}
              role="region"
            >
              {slots[shape.id] && slotStates[shape.id] !== 'wrong' ? (
                <ShapeIcon shape={shape.shape} color={shape.color} size={50} />
              ) : (
                <ShapeIcon shape={shape.shape} color="transparent" size={50} outline={shape.color} />
              )}
            </div>
          ))}
        </div>

        {dragging && (
          <p className="ss-hint" aria-live="polite">
            Drop on the matching {SHAPES.find(s => s.id === dragging)?.colorName.toLowerCase()} outline!
          </p>
        )}
      </div>
    </div>
  )
}

function ShapeIcon({
  shape, color, size, outline
}: {
  shape: Shape['shape']
  color: string
  size: number
  outline?: string
}) {
  const stroke = outline ?? 'none'
  const fill = color === 'transparent' ? 'none' : color

  switch (shape) {
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <circle cx="28" cy="28" r="24" fill={fill} stroke={stroke} strokeWidth="3" strokeDasharray={outline ? '6 3' : '0'} />
        </svg>
      )
    case 'square':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <rect x="6" y="6" width="44" height="44" rx="4" fill={fill} stroke={stroke} strokeWidth="3" strokeDasharray={outline ? '6 3' : '0'} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <polygon points="28,4 52,52 4,52" fill={fill} stroke={stroke} strokeWidth="3" strokeDasharray={outline ? '6 3' : '0'} />
        </svg>
      )
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <polygon
            points="28,4 34,20 52,20 38,32 43,50 28,40 13,50 18,32 4,20 22,20"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
            strokeDasharray={outline ? '6 3' : '0'}
          />
        </svg>
      )
  }
}
