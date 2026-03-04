import { describe, it, expect, vi } from 'vitest'
import { Game } from '../Game'
import { GameState, Direction } from '../types'
import { getSpeedForLevel, getLevelForScore } from '../Level'
import { Snake } from '../Snake'
import { Grid } from '../Grid'

describe('Level', () => {
  it('returns 150ms at level 1', () => {
    expect(getSpeedForLevel(1)).toBe(150)
  })

  it('decrements speed by 10ms per level', () => {
    expect(getSpeedForLevel(2)).toBe(140)
    expect(getSpeedForLevel(3)).toBe(130)
  })

  it('clamps speed to minimum 50ms', () => {
    expect(getSpeedForLevel(100)).toBe(50)
  })

  it('returns level 1 for score 0', () => {
    expect(getLevelForScore(0)).toBe(1)
  })

  it('levels up every 5 food eaten', () => {
    expect(getLevelForScore(5)).toBe(2)
    expect(getLevelForScore(10)).toBe(3)
  })
})

describe('Snake', () => {
  it('initializes with correct length and direction', () => {
    const snake = new Snake(10, 10, 3)
    expect(snake.getSegments()).toHaveLength(3)
    expect(snake.direction).toBe(Direction.Right)
  })

  it('getHead returns last segment', () => {
    const snake = new Snake(10, 10, 3)
    const head = snake.getHead()
    expect(head).toEqual({ x: 10, y: 10 })
  })

  it('move advances head and removes tail', () => {
    const snake = new Snake(10, 10, 3)
    const lengthBefore = snake.getSegments().length
    snake.move()
    expect(snake.getSegments()).toHaveLength(lengthBefore)
    expect(snake.getHead()).toEqual({ x: 11, y: 10 })
  })

  it('grow advances head without removing tail', () => {
    const snake = new Snake(10, 10, 3)
    const lengthBefore = snake.getSegments().length
    snake.grow()
    expect(snake.getSegments()).toHaveLength(lengthBefore + 1)
  })

  it('blocks 180-degree direction reversal', () => {
    const snake = new Snake(10, 10, 3)
    snake.setDirection(Direction.Left)
    expect(snake.nextDirection).toBe(Direction.Right)
  })

  it('allows perpendicular direction change', () => {
    const snake = new Snake(10, 10, 3)
    snake.setDirection(Direction.Up)
    expect(snake.nextDirection).toBe(Direction.Up)
  })

  it('detects wall collision', () => {
    const snake = new Snake(0, 0, 1)
    snake.setDirection(Direction.Up)
    snake.move()
    expect(snake.checkWallCollision(20, 20)).toBe(true)
  })

  it('detects self collision', () => {
    const snake = new Snake(10, 10, 3)
    // Force head onto a body segment
    snake.segments.push({ x: snake.segments[0].x, y: snake.segments[0].y })
    expect(snake.checkSelfCollision()).toBe(true)
  })
})

describe('Grid', () => {
  it('initializes with given dimensions', () => {
    const grid = new Grid(20, 20)
    expect(grid.width).toBe(20)
    expect(grid.height).toBe(20)
  })

  it('validates cells within bounds', () => {
    const grid = new Grid(20, 20)
    expect(grid.isValidCell(0, 0)).toBe(true)
    expect(grid.isValidCell(19, 19)).toBe(true)
    expect(grid.isValidCell(20, 0)).toBe(false)
    expect(grid.isValidCell(0, 20)).toBe(false)
    expect(grid.isValidCell(-1, 0)).toBe(false)
  })
})

describe('Game', () => {
  it('initializes in MENU state', () => {
    const game = new Game()
    expect(game.state).toBe(GameState.MENU)
  })

  it('start transitions to PLAYING state', () => {
    const game = new Game()
    game.start()
    expect(game.state).toBe(GameState.PLAYING)
  })

  it('spawns snake at grid center with length 3', () => {
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    game.start()
    expect(game.snake.getSegments()).toHaveLength(3)
    const head = game.snake.getHead()
    expect(head.x).toBe(10)
    expect(head.y).toBe(10)
  })

  it('snake moves each update tick', () => {
    const game = new Game()
    game.start()
    const headBefore = { ...game.snake.getHead() }
    game.update()
    const headAfter = game.snake.getHead()
    expect(headAfter).not.toEqual(headBefore)
  })

  it('eating food increments score and grows snake', () => {
    const game = new Game()
    game.start()
    const initialLength = game.snake.getSegments().length
    // Place food directly in front of snake head
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(game.score).toBe(1)
    expect(game.snake.getSegments().length).toBe(initialLength + 1)
  })

  it('wall collision triggers GAME_OVER', () => {
    const game = new Game()
    game.start()
    // Force snake to wall
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = Direction.Right
    game.snake.nextDirection = Direction.Right
    game.update()
    expect(game.state).toBe(GameState.GAME_OVER)
  })

  it('self collision triggers GAME_OVER', () => {
    const game = new Game()
    game.start()
    // Insert next-head position in middle of segments so move() doesn't pop it as tail
    const head = game.snake.getHead()
    const nextHead = { x: head.x + 1, y: head.y }
    game.snake.segments.splice(1, 0, nextHead)
    game.update()
    expect(game.state).toBe(GameState.GAME_OVER)
  })

  it('level increases every 5 food eaten', () => {
    const game = new Game()
    game.start()
    game.score = 4
    game['level'] = 1
    // Manually trigger level check
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(game.level).toBe(2)
  })

  it('pause and resume toggle game state', () => {
    const game = new Game()
    game.start()
    game.pause()
    expect(game.state).toBe(GameState.PAUSED)
    game.resume()
    expect(game.state).toBe(GameState.PLAYING)
  })

  it('reset returns to MENU state', () => {
    const game = new Game()
    game.start()
    game.reset()
    expect(game.state).toBe(GameState.MENU)
  })

  it('speed decreases with level via getTickInterval', () => {
    const game = new Game()
    game.start()
    const speed1 = game.getTickInterval()
    game['level'] = 2
    const speed2 = game.getTickInterval()
    expect(speed2).toBeLessThan(speed1)
  })

  it('fires onScoreChange callback when eating', () => {
    const onScoreChange = vi.fn()
    const game = new Game({}, { onScoreChange })
    game.start()
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(onScoreChange).toHaveBeenCalledWith(1)
  })

  it('fires onStateChange callback on start', () => {
    const onStateChange = vi.fn()
    const game = new Game({}, { onStateChange })
    game.start()
    expect(onStateChange).toHaveBeenCalledWith(GameState.PLAYING)
  })
})
