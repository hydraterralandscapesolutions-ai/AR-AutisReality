import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import './Home.css'

export default function Home() {
  usePageTitle('Home')

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__content">
          <div className="hero__badge">🌟 Supporting Every Journey</div>
          <h1 id="hero-heading" className="hero__title">
            Empowering Families,<br />
            <span className="hero__title--accent">One Step at a Time</span>
          </h1>
          <p className="hero__description">
            AutisReality is a safe, supportive space for parents of autistic children.
            Discover resources, play interactive learning games, earn rewards, and find
            calm&nbsp;–&nbsp;all in one place.
          </p>
          <div className="hero__actions">
            <Link to="/resources" className="btn btn-primary" aria-label="Browse parent resources">
              📚 Resources for Parents
            </Link>
            <Link to="/games" className="btn btn-secondary" aria-label="Explore interactive games">
              🎮 Play &amp; Learn
            </Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__circles">
            <div className="hero__circle hero__circle--1">🧩</div>
            <div className="hero__circle hero__circle--2">🌈</div>
            <div className="hero__circle hero__circle--3">⭐</div>
            <div className="hero__circle hero__circle--4">🎯</div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features page" aria-labelledby="features-heading">
        <h2 id="features-heading" className="page-title text-center">What You'll Find Here</h2>
        <p className="page-subtitle text-center">
          Designed with love for autistic children and the families who support them.
        </p>
        <div className="features__grid" role="list">
          {FEATURES.map(f => (
            <article key={f.title} className="feature-card card" role="listitem">
              <div className="feature-card__icon" aria-hidden="true">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <Link to={f.link} className="btn btn-outline mt-2">
                {f.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

const FEATURES = [
  {
    icon: '📚',
    title: 'Parent Resources',
    desc: 'Curated articles on autism spectrum, communication, sensory needs, and daily routines to empower every caregiver.',
    link: '/resources',
    cta: 'Explore Resources',
  },
  {
    icon: '🎮',
    title: 'Interactive Games',
    desc: 'Fun, educational mini-games that build emotional recognition, pattern thinking, and fine motor skills.',
    link: '/games',
    cta: 'Start Playing',
  },
  {
    icon: '🏆',
    title: 'Rewards Dashboard',
    desc: 'Earn stars and unlock badges as you play. A motivating reward system that celebrates every achievement.',
    link: '/rewards',
    cta: 'View Rewards',
  },
  {
    icon: '🌿',
    title: 'Calm Corner',
    desc: 'Breathing exercises, a mood journal, and calming activities for emotional regulation and self-care.',
    link: '/calm',
    cta: 'Find Calm',
  },
]
