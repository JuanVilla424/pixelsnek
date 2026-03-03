import { Position } from './types'

export class Grid {
  readonly width: number
  readonly height: number
  readonly cellSize: number

  constructor(width: number = 20, height: number = 20, canvasWidth?: number, canvasHeight?: number) {
    this.width = width
    this.height = height
    if (canvasWidth !== undefined && canvasHeight !== undefined) {
      this.cellSize = Math.floor(Math.min(canvasWidth / width, canvasHeight / height))
    } else {
      this.cellSize = 20
    }
  }

  getCellPosition(x: number, y: number): Position {
    return { x: x * this.cellSize, y: y * this.cellSize }
  }

  isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  getRandomEmptyCell(occupiedCells: Position[]): Position {
    const occupied = new Set(occupiedCells.map(p => `${p.x},${p.y}`))
    const empty: Position[] = []

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!occupied.has(`${x},${y}`)) {
          empty.push({ x, y })
        }
      }
    }

    if (empty.length === 0) {
      throw new Error('No empty cells available')
    }

    return empty[Math.floor(Math.random() * empty.length)]
  }
}
