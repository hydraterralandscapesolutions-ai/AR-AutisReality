import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import EmotionMatching from './games/EmotionMatching'
import PatternSequence from './games/PatternSequence'
import ShapeSorter from './games/ShapeSorter'
import './Games.css'

type GameId = 'emotion' | 'pattern' | 'shape' | null

export default function Games() {
  usePageTitle('Games')
  const [activeGame, setActiveGame] = useState<GameId>(null)

  if (activeGame === 'emotion') {
    return <EmotionMatching onBack={() => setActiveGame(null)} />
  }
  if (activeGame === 'pattern') {
    return <PatternSequence onBack={() => setActiveGame(null)} />
  }
  if (activeGame === 'shape') {
    return <ShapeSorter onBack={() => setActiveGame(null)} />
  }

  return (
    <div className="page">
      <h1 className="page-title">🎮 Games &amp; Learning</h1>
      <p className="page-subtitle">
        Interactive mini-games that build emotional awareness, memory, and problem-solving skills.
        Complete games to earn ⭐ stars!
      </p>

      <div className="games-grid" role="list">
        {GAME_CARDS.map(g => (
          <article key={g.id} className="game-card card" role="listitem" aria-labelledby={`game-${g.id}`}>
            <div className="game-card__icon" aria-hidden="true">{g.icon}</div>
            <h2 id={`game-${g.id}`} className="game-card__title">{g.title}</h2>
            <p className="game-card__desc">{g.desc}</p>
            <div className="game-card__meta">
              <span className="game-card__tag">{g.tag}</span>
              <span className="game-card__stars">⭐ Earns stars</span>
            </div>
            <button
              className="btn btn-primary game-card__btn"
              onClick={() => setActiveGame(g.id as GameId)}
              aria-label={`Play ${g.title}`}
            >
              Play Now
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

const GAME_CARDS = [
  {
    id: 'emotion',
    icon: '😊',
    title: 'Emotion Matching',
    desc: 'Look at the emoji face and pick the correct emotion name. Builds emotional recognition skills.',
    tag: '🧠 Emotions',
  },
  {
    id: 'pattern',
    icon: '🎨',
    title: 'Pattern Sequence',
    desc: 'Watch the colored block pattern, then repeat it! Gets harder as you level up.',
    tag: '💡 Memory',
  },
  {
    id: 'shape',
    icon: '🔷',
    title: 'Shape Sorter',
    desc: 'Drag and drop the colored shapes into their matching outlines. Builds visual matching skills.',
    tag: '🖐 Motor Skills',
  },
]
