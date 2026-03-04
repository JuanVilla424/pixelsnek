import { describe, expect, it } from 'vitest'
import { Direction, isOppositeDirection } from '../types'

describe('isOppositeDirection', () => {
  it('Up and Down are opposites', () => {
    expect(isOppositeDirection(Direction.Up, Direction.Down)).toBe(true)
  })

  it('Down and Up are opposites', () => {
    expect(isOppositeDirection(Direction.Down, Direction.Up)).toBe(true)
  })

  it('Left and Right are opposites', () => {
    expect(isOppositeDirection(Direction.Left, Direction.Right)).toBe(true)
  })

  it('Right and Left are opposites', () => {
    expect(isOppositeDirection(Direction.Right, Direction.Left)).toBe(true)
  })

  it('same direction is not opposite', () => {
    expect(isOppositeDirection(Direction.Up, Direction.Up)).toBe(false)
    expect(isOppositeDirection(Direction.Down, Direction.Down)).toBe(false)
    expect(isOppositeDirection(Direction.Left, Direction.Left)).toBe(false)
    expect(isOppositeDirection(Direction.Right, Direction.Right)).toBe(false)
  })

  it('perpendicular directions are not opposites', () => {
    expect(isOppositeDirection(Direction.Up, Direction.Left)).toBe(false)
    expect(isOppositeDirection(Direction.Up, Direction.Right)).toBe(false)
    expect(isOppositeDirection(Direction.Down, Direction.Left)).toBe(false)
    expect(isOppositeDirection(Direction.Down, Direction.Right)).toBe(false)
    expect(isOppositeDirection(Direction.Left, Direction.Up)).toBe(false)
    expect(isOppositeDirection(Direction.Left, Direction.Down)).toBe(false)
    expect(isOppositeDirection(Direction.Right, Direction.Up)).toBe(false)
    expect(isOppositeDirection(Direction.Right, Direction.Down)).toBe(false)
  })
})
