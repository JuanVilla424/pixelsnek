import { describe, it, expect } from 'vitest'
import { Grid } from '../Grid'

describe('Grid', () => {
  it('constructs with default 20x20 dimensions', () => {
    const grid = new Grid()
    expect(grid.width).toBe(20)
    expect(grid.height).toBe(20)
  })

  it('constructs with custom dimensions', () => {
    const grid = new Grid(30, 15)
    expect(grid.width).toBe(30)
    expect(grid.height).toBe(15)
  })

  it('uses default cellSize 20 when no canvas dimensions provided', () => {
    const grid = new Grid(20, 20)
    expect(grid.cellSize).toBe(20)
  })

  it('computes cellSize from canvas dimensions', () => {
    const grid = new Grid(20, 20, 400, 400)
    expect(grid.cellSize).toBe(20)
  })

  it('getCellPosition returns correct pixel coords', () => {
    const grid = new Grid(20, 20)
    expect(grid.getCellPosition(0, 0)).toEqual({ x: 0, y: 0 })
    expect(grid.getCellPosition(3, 5)).toEqual({ x: 60, y: 100 })
    expect(grid.getCellPosition(19, 19)).toEqual({ x: 380, y: 380 })
  })

  it('getCellPosition uses cellSize in computation', () => {
    const grid = new Grid(10, 10, 500, 500)
    expect(grid.getCellPosition(1, 2)).toEqual({ x: 50, y: 100 })
  })

  it('isValidCell returns true for cells within bounds', () => {
    const grid = new Grid(20, 20)
    expect(grid.isValidCell(0, 0)).toBe(true)
    expect(grid.isValidCell(19, 19)).toBe(true)
    expect(grid.isValidCell(10, 10)).toBe(true)
  })

  it('isValidCell returns false for cells out of bounds', () => {
    const grid = new Grid(20, 20)
    expect(grid.isValidCell(-1, 0)).toBe(false)
    expect(grid.isValidCell(0, -1)).toBe(false)
    expect(grid.isValidCell(20, 0)).toBe(false)
    expect(grid.isValidCell(0, 20)).toBe(false)
    expect(grid.isValidCell(20, 20)).toBe(false)
  })

  it('getRandomEmptyCell returns a cell not in the occupied list', () => {
    const grid = new Grid(20, 20)
    const occupied = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }]
    const result = grid.getRandomEmptyCell(occupied)
    expect(occupied.some(p => p.x === result.x && p.y === result.y)).toBe(false)
  })

  it('getRandomEmptyCell returns a valid cell within grid bounds', () => {
    const grid = new Grid(20, 20)
    const result = grid.getRandomEmptyCell([])
    expect(grid.isValidCell(result.x, result.y)).toBe(true)
  })

  it('getRandomEmptyCell works with nearly full grid', () => {
    const grid = new Grid(3, 3)
    const occupied = []
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (!(x === 2 && y === 2)) {
          occupied.push({ x, y })
        }
      }
    }
    const result = grid.getRandomEmptyCell(occupied)
    expect(result).toEqual({ x: 2, y: 2 })
  })

  it('getRandomEmptyCell throws when no empty cells remain', () => {
    const grid = new Grid(2, 2)
    const occupied = [
      { x: 0, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 },
    ]
    expect(() => grid.getRandomEmptyCell(occupied)).toThrow('No empty cells available')
  })
})
