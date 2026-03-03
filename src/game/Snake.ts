import { Direction, Position } from './types'

const OPPOSITE: Record<Direction, Direction> = {
  [Direction.Up]: Direction.Down,
  [Direction.Down]: Direction.Up,
  [Direction.Left]: Direction.Right,
  [Direction.Right]: Direction.Left,
}

const DELTA: Record<Direction, Position> = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
}

export class Snake {
  segments: Position[]
  direction: Direction
  nextDirection: Direction

  constructor(startX: number, startY: number, length: number = 3) {
    this.direction = Direction.Right
    this.nextDirection = Direction.Right
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

  getSegments(): Position[] {
    return this.segments
  }
}
