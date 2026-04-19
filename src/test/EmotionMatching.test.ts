import { describe, it, expect } from 'vitest'
import { buildRound, EMOTIONS } from '../pages/games/EmotionMatching'

describe('Emotion Matching – game logic', () => {
  it('buildRound returns a correct emotion that is in the choices', () => {
    const { correct, choices } = buildRound()
    expect(choices).toContainEqual(correct)
  })

  it('buildRound returns exactly 4 choices', () => {
    const { choices } = buildRound()
    expect(choices).toHaveLength(4)
  })

  it('all choices are distinct emotion names', () => {
    const { choices } = buildRound()
    const names = choices.map(c => c.name)
    const unique = new Set(names)
    expect(unique.size).toBe(4)
  })

  it('correct emotion is always one of the EMOTIONS items', () => {
    for (let i = 0; i < 10; i++) {
      const { correct } = buildRound()
      expect(EMOTIONS).toContainEqual(correct)
    }
  })

  it('all choices are from the EMOTIONS list', () => {
    const { choices } = buildRound()
    choices.forEach(choice => {
      expect(EMOTIONS).toContainEqual(choice)
    })
  })
})
