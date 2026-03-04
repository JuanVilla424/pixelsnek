import { describe, it, expect } from 'vitest'
import { Food } from '../Food'
import { Grid } from '../Grid'
import { Snake } from '../Snake'

describe('Food', () => {
  it('getPosition returns initial zero position before spawn', () => {
    const food = new Food()
    expect(food.getPosition()).toEqual({ x: 0, y: 0 })
  })

  it('spawn places food on a valid grid cell', () => {
    const grid = new Grid(20, 20)
    const snake = new Snake(10, 10, 3)
    const food = new Food()
    food.spawn(grid, snake)
    const pos = food.getPosition()
    expect(grid.isValidCell(pos.x, pos.y)).toBe(true)
  })

  it('spawn avoids snake body positions', () => {
    const grid = new Grid(20, 20)
    const snake = new Snake(10, 10, 3)
    const food = new Food()
    for (let i = 0; i < 20; i++) {
      food.spawn(grid, snake)
      const pos = food.getPosition()
      const onSnake = snake.getSegments().some(s => s.x === pos.x && s.y === pos.y)
      expect(onSnake).toBe(false)
    }
  })

  it('getPosition returns the position set by spawn', () => {
    const grid = new Grid(20, 20)
    const snake = new Snake(10, 10, 3)
    const food = new Food()
    food.spawn(grid, snake)
    const pos = food.getPosition()
    expect(typeof pos.x).toBe('number')
    expect(typeof pos.y).toBe('number')
    expect(pos.x).toBeGreaterThanOrEqual(0)
    expect(pos.y).toBeGreaterThanOrEqual(0)
    expect(pos.x).toBeLessThan(20)
    expect(pos.y).toBeLessThan(20)
  })

  it('spawn can be called multiple times, updating position', () => {
    const grid = new Grid(20, 20)
    const snake = new Snake(10, 10, 3)
    const food = new Food()
    food.spawn(grid, snake)
    const first = { ...food.getPosition() }
    // Spawn many times — eventually position should vary (probabilistic)
    let different = false
    for (let i = 0; i < 50; i++) {
      food.spawn(grid, snake)
      const pos = food.getPosition()
      if (pos.x !== first.x || pos.y !== first.y) {
        different = true
        break
      }
    }
    expect(different).toBe(true)
  })

  it('spawn throws when grid is entirely occupied by snake', () => {
    const grid = new Grid(2, 2)
    const snake = new Snake(1, 1, 1)
    // Manually fill all 4 cells
    snake.segments = [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 },
    ]
    const food = new Food()
    expect(() => food.spawn(grid, snake)).toThrow()
  })
})
