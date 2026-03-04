import { describe, it, expect } from 'vitest'
import { getSpeedForLevel, getLevelForScore } from '../Level'

describe('getSpeedForLevel', () => {
  it('returns 150 at level 1', () => {
    expect(getSpeedForLevel(1)).toBe(150)
  })

  it('returns 140 at level 2', () => {
    expect(getSpeedForLevel(2)).toBe(140)
  })

  it('returns 110 at level 5', () => {
    expect(getSpeedForLevel(5)).toBe(110)
  })

  it('returns 50 at level 11 (minimum reached)', () => {
    expect(getSpeedForLevel(11)).toBe(50)
  })

  it('returns 50 at level 20 (clamped to minimum)', () => {
    expect(getSpeedForLevel(20)).toBe(50)
  })

  it('returns 50 for very high levels (clamped)', () => {
    expect(getSpeedForLevel(100)).toBe(50)
  })

  it('decrements by 10ms per level', () => {
    expect(getSpeedForLevel(3)).toBe(130)
    expect(getSpeedForLevel(4)).toBe(120)
    expect(getSpeedForLevel(6)).toBe(100)
    expect(getSpeedForLevel(10)).toBe(60)
  })
})

describe('getLevelForScore', () => {
  it('returns level 1 for score 0', () => {
    expect(getLevelForScore(0)).toBe(1)
  })

  it('returns level 1 for score 1-4', () => {
    expect(getLevelForScore(1)).toBe(1)
    expect(getLevelForScore(4)).toBe(1)
  })

  it('returns level 2 for score 5', () => {
    expect(getLevelForScore(5)).toBe(2)
  })

  it('returns level 2 for score 6-9', () => {
    expect(getLevelForScore(6)).toBe(2)
    expect(getLevelForScore(9)).toBe(2)
  })

  it('returns level 3 for score 10', () => {
    expect(getLevelForScore(10)).toBe(3)
  })

  it('returns level 3 for score 14', () => {
    expect(getLevelForScore(14)).toBe(3)
  })

  it('increments level every 5 food eaten', () => {
    expect(getLevelForScore(15)).toBe(4)
    expect(getLevelForScore(20)).toBe(5)
    expect(getLevelForScore(25)).toBe(6)
  })
})
