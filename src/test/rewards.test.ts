import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStars,
  addStars,
  resetStars,
  getEarnedBadges,
  BADGES,
} from '../store/rewards'

describe('Rewards store logic', () => {
  beforeEach(() => {
    resetStars()
  })

  it('getStars returns 0 after reset', () => {
    expect(getStars()).toBe(0)
  })

  it('addStars increases the star count', () => {
    addStars(3)
    expect(getStars()).toBe(3)
  })

  it('addStars is cumulative', () => {
    addStars(2)
    addStars(5)
    expect(getStars()).toBe(7)
  })

  it('resetStars sets stars back to 0', () => {
    addStars(10)
    resetStars()
    expect(getStars()).toBe(0)
  })

  it('getEarnedBadges returns no badges before threshold', () => {
    const badges = getEarnedBadges(4)
    expect(badges).toHaveLength(0)
  })

  it('getEarnedBadges returns Rising Star badge at 5 stars', () => {
    const badges = getEarnedBadges(5)
    expect(badges.some(b => b.id === 'first5')).toBe(true)
  })

  it('getEarnedBadges returns 2 badges at 10 stars', () => {
    const badges = getEarnedBadges(10)
    expect(badges).toHaveLength(2)
  })

  it('getEarnedBadges returns all 3 badges at 25 stars', () => {
    const badges = getEarnedBadges(25)
    expect(badges).toHaveLength(BADGES.length)
  })
})
