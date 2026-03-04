export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === Direction.Up && b === Direction.Down) ||
    (a === Direction.Down && b === Direction.Up) ||
    (a === Direction.Left && b === Direction.Right) ||
    (a === Direction.Right && b === Direction.Left)
  )
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface Position {
  x: number
  y: number
}

export interface GameConfig {
  gridWidth: number
  gridHeight: number
  initialSpeed: number
}

export interface GameCallbacks {
  onScoreChange?: (score: number) => void
  onLevelChange?: (level: number) => void
  onEat?: (position: Position) => void
  onDeath?: (segments: Position[]) => void
  onStateChange?: (state: GameState) => void
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  lifetime: number
  maxLifetime: number
  gravity: number
}

export interface GameSnapshot {
  segments: Position[]
  food: Position
  direction: Direction
  score: number
  gameOver: boolean
  gridWidth: number
  gridHeight: number
  particles: Particle[]
}
