import { describe, it, expect, vi } from 'vitest'
import { Game } from '../Game'
import { GameState, Direction } from '../types'

describe('Game instantiation', () => {
  it('can be instantiated with default config', () => {
    const game = new Game()
    expect(game).toBeDefined()
    expect(game.grid).toBeDefined()
    expect(game.snake).toBeDefined()
    expect(game.food).toBeDefined()
  })

  it('starts in MENU state', () => {
    const game = new Game()
    expect(game.state).toBe(GameState.MENU)
  })

  it('starts with score 0', () => {
    const game = new Game()
    expect(game.score).toBe(0)
  })

  it('starts at level 1', () => {
    const game = new Game()
    expect(game.level).toBe(1)
  })
})

describe('Game.start()', () => {
  it('transitions state to PLAYING', () => {
    const game = new Game()
    game.start()
    expect(game.state).toBe(GameState.PLAYING)
  })

  it('spawns snake at grid center with length 3', () => {
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    game.start()
    const segments = game.snake.getSegments()
    expect(segments).toHaveLength(3)
    expect(game.snake.getHead()).toEqual({ x: 10, y: 10 })
  })

  it('resets score to 0', () => {
    const game = new Game()
    game.start()
    game.score = 10
    game.start()
    expect(game.score).toBe(0)
  })

  it('resets level to 1', () => {
    const game = new Game()
    game.start()
    game['level'] = 5
    game.start()
    expect(game.level).toBe(1)
  })
})

describe('Game.update() — movement', () => {
  it('moves snake each tick while PLAYING', () => {
    const game = new Game()
    game.start()
    const headBefore = { ...game.snake.getHead() }
    game.update()
    expect(game.snake.getHead()).not.toEqual(headBefore)
  })

  it('does nothing when not in PLAYING state', () => {
    const game = new Game()
    // state is MENU — update should no-op
    const headBefore = { ...game.snake.getHead() }
    game.update()
    expect(game.snake.getHead()).toEqual(headBefore)
  })
})

describe('Game.update() — eating food', () => {
  it('eating food increments score by 1', () => {
    const game = new Game()
    game.start()
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(game.score).toBe(1)
  })

  it('eating food grows snake by 1', () => {
    const game = new Game()
    game.start()
    const lenBefore = game.snake.getSegments().length
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(game.snake.getSegments().length).toBe(lenBefore + 1)
  })

  it('eating food respawns food at new location', () => {
    const game = new Game()
    game.start()
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    const oldPos = { ...game.food.getPosition() }
    game.update()
    // Food should have been respawned (may or may not be same spot by random chance)
    // Just verify it's on a valid cell
    const newPos = game.food.getPosition()
    expect(game.grid.isValidCell(newPos.x, newPos.y)).toBe(true)
    // And it's not on the snake body
    const onSnake = game.snake.getSegments().some(s => s.x === newPos.x && s.y === newPos.y)
    expect(onSnake).toBe(false)
    // Suppress unused variable warning
    void oldPos
  })
})

describe('Game.update() — collisions', () => {
  it('wall collision triggers GAME_OVER', () => {
    const game = new Game()
    game.start()
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = Direction.Right
    game.snake.nextDirection = Direction.Right
    game.update()
    expect(game.state).toBe(GameState.GAME_OVER)
  })

  it('self collision triggers GAME_OVER', () => {
    const game = new Game()
    game.start()
    const head = game.snake.getHead()
    const nextHead = { x: head.x + 1, y: head.y }
    game.snake.segments.splice(1, 0, nextHead)
    game.update()
    expect(game.state).toBe(GameState.GAME_OVER)
  })

  it('updates highScore on death', () => {
    const game = new Game()
    game.start()
    game.score = 5
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = Direction.Right
    game.snake.nextDirection = Direction.Right
    game.update()
    expect(game.highScore).toBe(5)
  })
})

describe('Game level progression', () => {
  it('level increases every 5 food eaten', () => {
    const game = new Game()
    game.start()
    game.score = 4
    game['level'] = 1
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(game.level).toBe(2)
  })

  it('speed decreases with level via getTickInterval', () => {
    const game = new Game()
    game.start()
    const speed1 = game.getTickInterval()
    game['level'] = 2
    const speed2 = game.getTickInterval()
    expect(speed2).toBeLessThan(speed1)
  })

  it('getTickInterval returns 150 at level 1', () => {
    const game = new Game()
    game.start()
    expect(game.getTickInterval()).toBe(150)
  })
})

describe('Game.pause() and Game.resume()', () => {
  it('pause transitions PLAYING to PAUSED', () => {
    const game = new Game()
    game.start()
    game.pause()
    expect(game.state).toBe(GameState.PAUSED)
  })

  it('resume transitions PAUSED to PLAYING', () => {
    const game = new Game()
    game.start()
    game.pause()
    game.resume()
    expect(game.state).toBe(GameState.PLAYING)
  })

  it('pause is no-op when not PLAYING', () => {
    const game = new Game()
    game.pause()
    expect(game.state).toBe(GameState.MENU)
  })

  it('resume is no-op when not PAUSED', () => {
    const game = new Game()
    game.start()
    game.resume()
    expect(game.state).toBe(GameState.PLAYING)
  })

  it('update does nothing while PAUSED', () => {
    const game = new Game()
    game.start()
    game.pause()
    const headBefore = { ...game.snake.getHead() }
    game.update()
    expect(game.snake.getHead()).toEqual(headBefore)
  })
})

describe('Game.reset()', () => {
  it('returns to MENU state', () => {
    const game = new Game()
    game.start()
    game.reset()
    expect(game.state).toBe(GameState.MENU)
  })

  it('can reset from GAME_OVER', () => {
    const game = new Game()
    game.start()
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = Direction.Right
    game.snake.nextDirection = Direction.Right
    game.update()
    expect(game.state).toBe(GameState.GAME_OVER)
    game.reset()
    expect(game.state).toBe(GameState.MENU)
  })
})

describe('Game callbacks', () => {
  it('fires onStateChange callback on start', () => {
    const onStateChange = vi.fn()
    const game = new Game({}, { onStateChange })
    game.start()
    expect(onStateChange).toHaveBeenCalledWith(GameState.PLAYING)
  })

  it('fires onScoreChange callback when eating food', () => {
    const onScoreChange = vi.fn()
    const game = new Game({}, { onScoreChange })
    game.start()
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(onScoreChange).toHaveBeenCalledWith(1)
  })

  it('fires onEat callback when eating food', () => {
    const onEat = vi.fn()
    const game = new Game({}, { onEat })
    game.start()
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(onEat).toHaveBeenCalled()
  })

  it('fires onLevelChange callback when level increases', () => {
    const onLevelChange = vi.fn()
    const game = new Game({}, { onLevelChange })
    game.start()
    game.score = 4
    game['level'] = 1
    const head = game.snake.getHead()
    game.food['position'] = { x: head.x + 1, y: head.y }
    game.update()
    expect(onLevelChange).toHaveBeenCalledWith(2)
  })

  it('fires onDeath callback on wall collision', () => {
    const onDeath = vi.fn()
    const game = new Game({}, { onDeath })
    game.start()
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = Direction.Right
    game.snake.nextDirection = Direction.Right
    game.update()
    expect(onDeath).toHaveBeenCalled()
  })

  it('fires onStateChange with GAME_OVER on collision', () => {
    const onStateChange = vi.fn()
    const game = new Game({}, { onStateChange })
    game.start()
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = Direction.Right
    game.snake.nextDirection = Direction.Right
    game.update()
    expect(onStateChange).toHaveBeenCalledWith(GameState.GAME_OVER)
  })

  it('fires onStateChange with PAUSED on pause', () => {
    const onStateChange = vi.fn()
    const game = new Game({}, { onStateChange })
    game.start()
    game.pause()
    expect(onStateChange).toHaveBeenCalledWith(GameState.PAUSED)
  })

  it('fires onStateChange with PLAYING on resume', () => {
    const onStateChange = vi.fn()
    const game = new Game({}, { onStateChange })
    game.start()
    game.pause()
    game.resume()
    expect(onStateChange).toHaveBeenCalledWith(GameState.PLAYING)
  })
})
