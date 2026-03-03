import { GameState, GameConfig, GameCallbacks, Direction, Position } from './types'
import { Grid } from './Grid'
import { Snake } from './Snake'
import { Food } from './Food'
import { getSpeedForLevel, getLevelForScore } from './Level'
export { Direction } from './types'
export type { GameCallbacks } from './types'

const DEFAULT_CONFIG: GameConfig = {
  gridWidth: 20,
  gridHeight: 20,
  initialSpeed: 150,
}

const DIRECTION_DELTA: Record<Direction, Position> = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
}

export class Game {
  readonly grid: Grid
  snake: Snake
  food: Food
  state: GameState
  score: number
  level: number
  highScore: number

  private config: GameConfig
  private callbacks: GameCallbacks
  private intervalId: ReturnType<typeof setInterval> | null

  constructor(config: Partial<GameConfig> = {}, callbacks: GameCallbacks = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.callbacks = callbacks
    this.grid = new Grid(this.config.gridWidth, this.config.gridHeight)
    this.snake = new Snake(0, 0)
    this.food = new Food()
    this.state = GameState.MENU
    this.score = 0
    this.level = 1
    this.highScore = 0
    this.intervalId = null
  }

  start(): void {
    this.score = 0
    this.level = 1
    const centerX = Math.floor(this.config.gridWidth / 2)
    const centerY = Math.floor(this.config.gridHeight / 2)
    this.snake = new Snake(centerX, centerY, 3)
    this.food = new Food()
    this.food.spawn(this.grid, this.snake)
    this._setState(GameState.PLAYING)
    this._startLoop()
  }

  update(): void {
    if (this.state !== GameState.PLAYING) return

    const food = this.food.getPosition()
    const nextHead = this._peekNextHead()
    const eats = nextHead.x === food.x && nextHead.y === food.y

    if (eats) {
      this.snake.grow()
    } else {
      this.snake.move()
    }

    if (
      this.snake.checkWallCollision(this.config.gridWidth, this.config.gridHeight) ||
      this.snake.checkSelfCollision()
    ) {
      this._die()
      return
    }

    if (eats) {
      this.score++
      this.callbacks.onEat?.(this.snake.getHead())
      this.callbacks.onScoreChange?.(this.score)

      const newLevel = getLevelForScore(this.score)
      if (newLevel !== this.level) {
        this.level = newLevel
        this.callbacks.onLevelChange?.(this.level)
        this._restartLoop()
      }

      this.food.spawn(this.grid, this.snake)
    }
  }

  pause(): void {
    if (this.state !== GameState.PLAYING) return
    this._stopLoop()
    this._setState(GameState.PAUSED)
  }

  resume(): void {
    if (this.state !== GameState.PAUSED) return
    this._setState(GameState.PLAYING)
    this._startLoop()
  }

  reset(): void {
    this._stopLoop()
    this._setState(GameState.MENU)
  }

  private _peekNextHead(): Position {
    const head = this.snake.getHead()
    const delta = DIRECTION_DELTA[this.snake.nextDirection]
    return { x: head.x + delta.x, y: head.y + delta.y }
  }

  private _die(): void {
    this._stopLoop()
    if (this.score > this.highScore) {
      this.highScore = this.score
    }
    this.callbacks.onDeath?.(this.snake.getHead())
    this._setState(GameState.GAME_OVER)
  }

  private _setState(state: GameState): void {
    this.state = state
    this.callbacks.onStateChange?.(state)
  }

  private _startLoop(): void {
    const speed = getSpeedForLevel(this.level)
    this.intervalId = setInterval(() => this.update(), speed)
  }

  private _stopLoop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private _restartLoop(): void {
    this._stopLoop()
    this._startLoop()
  }
}
