import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DARK } from '../Theme'
import { Leaderboard, LeaderboardEntry } from '../Leaderboard'

const STORAGE_KEY = 'pixelsnek-leaderboard'

function makeEntry(score: number, name = 'Player', level = 1): LeaderboardEntry {
  return { name, score, level, date: new Date().toISOString() }
}

function makeCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    roundRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe('Leaderboard', () => {
  let lb: Leaderboard

  beforeEach(() => {
    localStorage.clear()
    lb = new Leaderboard()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    lb.hideNameInput()
  })

  describe('getEntries()', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(lb.getEntries()).toEqual([])
    })

    it('returns parsed entries sorted by score descending', () => {
      const entries = [makeEntry(100), makeEntry(500), makeEntry(200)]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      const result = lb.getEntries()
      expect(result[0].score).toBe(500)
      expect(result[1].score).toBe(200)
      expect(result[2].score).toBe(100)
    })

    it('returns at most 10 entries', () => {
      const entries = Array.from({ length: 15 }, (_, i) => makeEntry(i * 10))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      expect(lb.getEntries()).toHaveLength(10)
    })

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json')
      expect(lb.getEntries()).toEqual([])
    })
  })

  describe('addEntry()', () => {
    it('saves entry to localStorage', () => {
      lb.addEntry(makeEntry(100))
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    })

    it('maintains sort order by score descending', () => {
      lb.addEntry(makeEntry(100))
      lb.addEntry(makeEntry(500))
      lb.addEntry(makeEntry(200))
      const entries = lb.getEntries()
      expect(entries[0].score).toBe(500)
      expect(entries[1].score).toBe(200)
      expect(entries[2].score).toBe(100)
    })

    it('trims to top 10 when exceeding limit', () => {
      for (let i = 1; i <= 12; i++) {
        lb.addEntry(makeEntry(i * 10))
      }
      expect(lb.getEntries()).toHaveLength(10)
    })

    it('keeps highest scores when trimming', () => {
      for (let i = 1; i <= 11; i++) {
        lb.addEntry(makeEntry(i * 10))
      }
      const entries = lb.getEntries()
      expect(entries[entries.length - 1].score).toBe(20)
    })
  })

  describe('isHighScore()', () => {
    it('returns true when fewer than 10 entries exist', () => {
      lb.addEntry(makeEntry(100))
      expect(lb.isHighScore(1)).toBe(true)
    })

    it('returns true when score exceeds lowest entry', () => {
      for (let i = 1; i <= 10; i++) {
        lb.addEntry(makeEntry(i * 100))
      }
      expect(lb.isHighScore(150)).toBe(true)
    })

    it('returns false when score is below lowest of 10 entries', () => {
      for (let i = 1; i <= 10; i++) {
        lb.addEntry(makeEntry(i * 100))
      }
      expect(lb.isHighScore(50)).toBe(false)
    })

    it('returns true when no entries exist', () => {
      expect(lb.isHighScore(1)).toBe(true)
    })

    it('returns false when score equals the lowest entry among 10', () => {
      for (let i = 1; i <= 10; i++) {
        lb.addEntry(makeEntry(i * 100))
      }
      // lowest is 100; score must be strictly greater
      expect(lb.isHighScore(100)).toBe(false)
    })
  })

  describe('clear()', () => {
    it('removes all entries from localStorage', () => {
      lb.addEntry(makeEntry(100))
      lb.clear()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('getEntries() returns empty array after clear', () => {
      lb.addEntry(makeEntry(100))
      lb.clear()
      expect(lb.getEntries()).toEqual([])
    })
  })

  describe('showNameInput()', () => {
    let canvas: HTMLCanvasElement

    beforeEach(() => {
      canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 300
      document.body.appendChild(canvas)
    })

    afterEach(() => {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    })

    it('creates an input element in the DOM', () => {
      lb.showNameInput(canvas, DARK, vi.fn())
      expect(document.querySelector('input')).not.toBeNull()
    })

    it('does not create a second input if one is already active', () => {
      lb.showNameInput(canvas, DARK, vi.fn())
      lb.showNameInput(canvas, DARK, vi.fn())
      expect(document.querySelectorAll('input')).toHaveLength(1)
    })

    it('calls onSubmit with entered name on Enter key', () => {
      const onSubmit = vi.fn()
      lb.showNameInput(canvas, DARK, onSubmit)
      const input = document.querySelector('input') as HTMLInputElement
      input.value = 'Alice'
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(onSubmit).toHaveBeenCalledWith('Alice')
    })

    it('defaults to "Player" when input is empty on Enter', () => {
      const onSubmit = vi.fn()
      lb.showNameInput(canvas, DARK, onSubmit)
      const input = document.querySelector('input') as HTMLInputElement
      input.value = ''
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(onSubmit).toHaveBeenCalledWith('Player')
    })

    it('defaults to "Player" when input contains only whitespace', () => {
      const onSubmit = vi.fn()
      lb.showNameInput(canvas, DARK, onSubmit)
      const input = document.querySelector('input') as HTMLInputElement
      input.value = '   '
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(onSubmit).toHaveBeenCalledWith('Player')
    })

    it('removes input element from DOM on Enter', () => {
      lb.showNameInput(canvas, DARK, vi.fn())
      const input = document.querySelector('input') as HTMLInputElement
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(document.querySelector('input')).toBeNull()
    })

    it('removes input element from DOM on Escape', () => {
      lb.showNameInput(canvas, DARK, vi.fn())
      const input = document.querySelector('input') as HTMLInputElement
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(document.querySelector('input')).toBeNull()
    })

    it('does not call onSubmit on Escape', () => {
      const onSubmit = vi.fn()
      lb.showNameInput(canvas, DARK, onSubmit)
      const input = document.querySelector('input') as HTMLInputElement
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('hideNameInput()', () => {
    let canvas: HTMLCanvasElement

    beforeEach(() => {
      canvas = document.createElement('canvas')
      document.body.appendChild(canvas)
    })

    afterEach(() => {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    })

    it('removes active input element from DOM', () => {
      lb.showNameInput(canvas, DARK, vi.fn())
      expect(document.querySelector('input')).not.toBeNull()
      lb.hideNameInput()
      expect(document.querySelector('input')).toBeNull()
    })

    it('does not throw when no input is active', () => {
      expect(() => lb.hideNameInput()).not.toThrow()
    })
  })

  describe('renderPanel()', () => {
    it('calls fillRect at least once (overlay background)', () => {
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      expect(ctx.fillRect).toHaveBeenCalled()
    })

    it('calls fillText with "LEADERBOARD" title', () => {
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls).toContain('LEADERBOARD')
    })

    it('calls fillText with "Press ESC to close"', () => {
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls).toContain('Press ESC to close')
    })

    it('calls fillText with "No entries yet" when leaderboard is empty', () => {
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls).toContain('No entries yet')
    })

    it('renders entry names when entries exist', () => {
      lb.addEntry(makeEntry(100, 'Alice'))
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls).toContain('Alice')
    })

    it('renders scores when entries exist', () => {
      lb.addEntry(makeEntry(999, 'Bob'))
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls).toContain('999')
    })

    it('shows clear prompt when entries exist', () => {
      lb.addEntry(makeEntry(100))
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls.some((t) => t.includes('clear'))).toBe(true)
    })

    it('shows confirmation prompt when clearConfirmPending is true', () => {
      lb.addEntry(makeEntry(100))
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK, undefined, true)
      const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0])
      expect(calls.some((t) => t.includes('confirm'))).toBe(true)
    })

    it('calls roundRect for the panel background', () => {
      const ctx = makeCtx()
      lb.renderPanel(ctx, 800, 600, DARK)
      expect(ctx.roundRect).toHaveBeenCalled()
    })
  })
})
