import { describe, it, expect } from 'vitest'
import { Snake } from '../Snake'
import { Direction } from '../types'

describe('Snake', () => {
  it('spawns with 3 segments at specified position', () => {
    const snake = new Snake(10, 10, 3)
    const segments = snake.getSegments()
    expect(segments).toHaveLength(3)
    expect(segments[segments.length - 1]).toEqual({ x: 10, y: 10 })
  })

  it('spawns with default length of 3', () => {
    const snake = new Snake(5, 5)
    expect(snake.getSegments()).toHaveLength(3)
  })

  it('starts moving right by default', () => {
    const snake = new Snake(10, 10, 3)
    expect(snake.direction).toBe(Direction.Right)
    expect(snake.nextDirection).toBe(Direction.Right)
  })

  it('getHead returns head position', () => {
    const snake = new Snake(10, 10, 3)
    expect(snake.getHead()).toEqual({ x: 10, y: 10 })
  })

  it('move advances head in current direction', () => {
    const snake = new Snake(10, 10, 3)
    snake.move()
    expect(snake.getHead()).toEqual({ x: 11, y: 10 })
  })

  it('move pops tail keeping length constant', () => {
    const snake = new Snake(10, 10, 3)
    const lenBefore = snake.getSegments().length
    snake.move()
    expect(snake.getSegments().length).toBe(lenBefore)
  })

  it('grow advances head without popping tail', () => {
    const snake = new Snake(10, 10, 3)
    const lenBefore = snake.getSegments().length
    snake.grow()
    expect(snake.getSegments().length).toBe(lenBefore + 1)
    expect(snake.getHead()).toEqual({ x: 11, y: 10 })
  })

  it('setDirection blocks opposite direction UP→DOWN', () => {
    const snake = new Snake(10, 10, 3)
    snake.direction = Direction.Up
    snake.nextDirection = Direction.Up
    snake.setDirection(Direction.Down)
    expect(snake.nextDirection).toBe(Direction.Up)
  })

  it('setDirection blocks opposite direction LEFT→RIGHT', () => {
    const snake = new Snake(10, 10, 3)
    // default direction is Right, so Left is blocked
    snake.setDirection(Direction.Left)
    expect(snake.nextDirection).toBe(Direction.Right)
  })

  it('setDirection blocks opposite direction DOWN→UP', () => {
    const snake = new Snake(10, 10, 3)
    snake.direction = Direction.Down
    snake.nextDirection = Direction.Down
    snake.setDirection(Direction.Up)
    expect(snake.nextDirection).toBe(Direction.Down)
  })

  it('setDirection allows perpendicular direction change', () => {
    const snake = new Snake(10, 10, 3)
    snake.setDirection(Direction.Up)
    expect(snake.nextDirection).toBe(Direction.Up)
  })

  it('setDirection allows non-opposite direction change', () => {
    const snake = new Snake(10, 10, 3)
    snake.setDirection(Direction.Down)
    expect(snake.nextDirection).toBe(Direction.Down)
  })

  it('checkSelfCollision returns false for normal snake', () => {
    const snake = new Snake(10, 10, 3)
    expect(snake.checkSelfCollision()).toBe(false)
  })

  it('checkSelfCollision returns true when head overlaps body', () => {
    const snake = new Snake(10, 10, 3)
    // Push head position into the middle of segments
    snake.segments.push({ x: snake.segments[0].x, y: snake.segments[0].y })
    expect(snake.checkSelfCollision()).toBe(true)
  })

  it('checkWallCollision returns false when inside grid', () => {
    const snake = new Snake(10, 10, 3)
    expect(snake.checkWallCollision(20, 20)).toBe(false)
  })

  it('checkWallCollision returns true when head is left of grid', () => {
    const snake = new Snake(0, 5, 1)
    snake.segments = [{ x: -1, y: 5 }]
    expect(snake.checkWallCollision(20, 20)).toBe(true)
  })

  it('checkWallCollision returns true when head is right of grid', () => {
    const snake = new Snake(19, 5, 1)
    snake.segments = [{ x: 20, y: 5 }]
    expect(snake.checkWallCollision(20, 20)).toBe(true)
  })

  it('checkWallCollision returns true when head is above grid', () => {
    const snake = new Snake(5, 0, 1)
    snake.segments = [{ x: 5, y: -1 }]
    expect(snake.checkWallCollision(20, 20)).toBe(true)
  })

  it('checkWallCollision returns true when head is below grid', () => {
    const snake = new Snake(5, 19, 1)
    snake.segments = [{ x: 5, y: 20 }]
    expect(snake.checkWallCollision(20, 20)).toBe(true)
  })

  it('move applies direction change from nextDirection', () => {
    const snake = new Snake(10, 10, 3)
    snake.setDirection(Direction.Up)
    snake.move()
    expect(snake.getHead()).toEqual({ x: 10, y: 9 })
    expect(snake.direction).toBe(Direction.Up)
  })

  it('getSegments returns all segments', () => {
    const snake = new Snake(10, 10, 5)
    expect(snake.getSegments()).toHaveLength(5)
  })
})
