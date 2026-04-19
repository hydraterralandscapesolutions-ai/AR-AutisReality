// Rewards store – persists stars in localStorage

const STARS_KEY = 'autisreality_stars'

export function getStars(): number {
  const raw = localStorage.getItem(STARS_KEY)
  if (!raw) return 0
  const n = parseInt(raw, 10)
  return isNaN(n) ? 0 : n
}

export function addStars(count: number): number {
  const current = getStars()
  const next = current + count
  localStorage.setItem(STARS_KEY, String(next))
  return next
}

export function resetStars(): void {
  localStorage.setItem(STARS_KEY, '0')
}

export interface Badge {
  id: string
  label: string
  emoji: string
  threshold: number
}

export const BADGES: Badge[] = [
  { id: 'first5',  label: 'Rising Star',   emoji: '⭐',  threshold: 5  },
  { id: 'ten',     label: 'Super Player',  emoji: '🏆',  threshold: 10 },
  { id: 'twentyfive', label: 'Champion',   emoji: '🎖️', threshold: 25 },
]

export function getEarnedBadges(stars: number): Badge[] {
  return BADGES.filter(b => stars >= b.threshold)
}
