import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getStars, BADGES, resetStars } from '../store/rewards'
import './Rewards.css'

export default function Rewards() {
  usePageTitle('Rewards')
  const [stars, setStars] = useState(getStars)

  const handleReset = () => {
    resetStars()
    setStars(0)
  }

  const nextBadge = BADGES.find(b => b.threshold > stars)
  const starsToNext = nextBadge ? nextBadge.threshold - stars : null

  return (
    <div className="page">
      <h1 className="page-title">🏆 Rewards Dashboard</h1>
      <p className="page-subtitle">
        Play games to earn ⭐ stars and unlock achievement badges!
      </p>

      {/* Star count */}
      <section className="rewards-hero card" aria-labelledby="star-count-heading">
        <div className="rewards-hero__star" aria-hidden="true">⭐</div>
        <div>
          <h2 id="star-count-heading" className="rewards-hero__count">
            {stars} {stars === 1 ? 'Star' : 'Stars'}
          </h2>
          {starsToNext !== null ? (
            <p className="rewards-hero__next">
              {starsToNext} more star{starsToNext !== 1 ? 's' : ''} until <strong>{nextBadge!.label}</strong> {nextBadge!.emoji}
            </p>
          ) : (
            <p className="rewards-hero__next rewards-hero__next--max">
              🎉 You've unlocked all badges! Amazing!
            </p>
          )}
        </div>
      </section>

      {/* Progress bar */}
      {nextBadge && (
        <div className="rewards-progress" aria-label="Progress to next badge">
          <div className="rewards-progress__label">
            <span>Progress to {nextBadge.label}</span>
            <span>{stars} / {nextBadge.threshold}</span>
          </div>
          <div
            className="rewards-progress__bar"
            role="progressbar"
            aria-valuenow={stars}
            aria-valuemin={0}
            aria-valuemax={nextBadge.threshold}
            aria-label={`${stars} of ${nextBadge.threshold} stars`}
          >
            <div
              className="rewards-progress__fill"
              style={{ width: `${Math.min((stars / nextBadge.threshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="rewards-section-title">Achievement Badges</h2>
        <div className="badges-grid" role="list">
          {BADGES.map(badge => {
            const earned = stars >= badge.threshold
            return (
              <div
                key={badge.id}
                className={`badge-card card${earned ? ' badge-card--earned' : ' badge-card--locked'}`}
                role="listitem"
                aria-label={`${badge.label} badge – ${earned ? 'unlocked' : `locked, need ${badge.threshold} stars`}`}
              >
                <div className="badge-card__emoji" aria-hidden="true">
                  {earned ? badge.emoji : '🔒'}
                </div>
                <div className="badge-card__label">{badge.label}</div>
                <div className="badge-card__threshold">
                  {earned
                    ? `✅ Unlocked at ${badge.threshold} stars`
                    : `Unlock at ${badge.threshold} ⭐`}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent activity hint */}
      <section className="rewards-tip card" aria-labelledby="tip-heading">
        <h2 id="tip-heading" className="rewards-section-title">💡 How to Earn Stars</h2>
        <ul className="rewards-tip__list">
          <li>🧠 <strong>Emotion Matching</strong> – 1–2 stars per session</li>
          <li>🎨 <strong>Pattern Sequence</strong> – 2 stars for completing all rounds</li>
          <li>🔷 <strong>Shape Sorter</strong> – 2 stars for sorting all shapes</li>
        </ul>
      </section>

      <div className="rewards-reset">
        <button
          className="btn btn-outline"
          onClick={handleReset}
          aria-label="Reset all stars and badges"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          🗑 Reset Progress
        </button>
      </div>
    </div>
  )
}
