import { Direction, Position } from './types'

const OPPOSITE: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
}

const DELTA: Record<Direction, Position> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
}

export class Snake {
  segments: Position[]
  direction: Direction
  nextDirection: Direction

  constructor(startX: number, startY: number, length: number = 3) {
    this.direction = Direction.RIGHT
    this.nextDirection = Direction.RIGHT
    this.segments = []
    for (let i = length - 1; i >= 0; i--) {
      this.segments.push({ x: startX - i, y: startY })
    }
  }

  getHead(): Position {
    return this.segments[this.segments.length - 1]
  }

  setDirection(dir: Direction): void {
    if (dir !== OPPOSITE[this.direction]) {
      this.nextDirection = dir
    }
  }

  move(): void {
    this.direction = this.nextDirection
    const head = this.getHead()
    const delta = DELTA[this.direction]
    this.segments.push({ x: head.x + delta.x, y: head.y + delta.y })
    this.segments.shift()
  }

  grow(): void {
    this.direction = this.nextDirection
    const head = this.getHead()
    const delta = DELTA[this.direction]
    this.segments.push({ x: head.x + delta.x, y: head.y + delta.y })
  }

  checkSelfCollision(): boolean {
    const head = this.getHead()
    return this.segments.slice(0, -1).some(s => s.x === head.x && s.y === head.y)
  }

  checkWallCollision(gridWidth: number, gridHeight: number): boolean {
    const head = this.getHead()
    return head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight
  }
}
