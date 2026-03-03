import { Position } from './types'
import { Grid } from './Grid'
import { Snake } from './Snake'

export class Food {
  private position: Position

  constructor() {
    this.position = { x: 0, y: 0 }
  }

  spawn(grid: Grid, snake: Snake): void {
    this.position = grid.getRandomEmptyCell(snake.segments)
  }

  getPosition(): Position {
    return this.position
  }
}
