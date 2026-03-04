import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DARK, LIGHT, ThemeManager } from '../Theme'

function makeMockMediaQuery(darkMatches: boolean) {
  const listeners: Set<() => void> = new Set()
  const mq = {
    matches: darkMatches,
    addEventListener: vi.fn((_event: string, cb: () => void) => {
      listeners.add(cb)
    }),
    removeEventListener: vi.fn((_event: string, cb: () => void) => {
      listeners.delete(cb)
    }),
    _trigger(newMatches: boolean) {
      mq.matches = newMatches
      listeners.forEach((cb) => cb())
    },
  }
  return mq
}

describe('ThemeManager', () => {
  let mockMediaQuery: ReturnType<typeof makeMockMediaQuery>
  let setPropertySpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    mockMediaQuery = makeMockMediaQuery(true)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMediaQuery as unknown as MediaQueryList)
    setPropertySpy = vi.fn()
    vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation(setPropertySpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('construction', () => {
    it('defaults to system when no localStorage value', () => {
      const tm = new ThemeManager()
      expect(tm.getPreference()).toBe('system')
    })

    it('reads dark preference from localStorage', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      expect(tm.getPreference()).toBe('dark')
    })

    it('reads light preference from localStorage', () => {
      localStorage.setItem('pixelsnek-theme', 'light')
      const tm = new ThemeManager()
      expect(tm.getPreference()).toBe('light')
    })

    it('reads system preference from localStorage', () => {
      localStorage.setItem('pixelsnek-theme', 'system')
      const tm = new ThemeManager()
      expect(tm.getPreference()).toBe('system')
    })

    it('falls back to system for invalid localStorage value', () => {
      localStorage.setItem('pixelsnek-theme', 'invalid')
      const tm = new ThemeManager()
      expect(tm.getPreference()).toBe('system')
    })

    it('adds change listener to matchMedia on construction', () => {
      const tm = new ThemeManager()
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
      tm.destroy()
    })

    it('applies theme on construction by calling setProperty', () => {
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--bg', expect.any(String))
    })
  })

  describe('getColors()', () => {
    it('returns DARK when preference is dark', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      expect(tm.getColors()).toEqual(DARK)
    })

    it('returns LIGHT when preference is light', () => {
      localStorage.setItem('pixelsnek-theme', 'light')
      const tm = new ThemeManager()
      expect(tm.getColors()).toEqual(LIGHT)
    })

    it('returns DARK when system and OS prefers dark', () => {
      // mockMediaQuery.matches = true (dark)
      const tm = new ThemeManager()
      expect(tm.getColors()).toEqual(DARK)
    })

    it('returns LIGHT when system and OS prefers light', () => {
      mockMediaQuery.matches = false
      const tm = new ThemeManager()
      expect(tm.getColors()).toEqual(LIGHT)
    })
  })

  describe('toggle()', () => {
    it('cycles dark → light → system → dark', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      expect(tm.getPreference()).toBe('dark')
      tm.toggle()
      expect(tm.getPreference()).toBe('light')
      tm.toggle()
      expect(tm.getPreference()).toBe('system')
      tm.toggle()
      expect(tm.getPreference()).toBe('dark')
    })

    it('persists toggled preference to localStorage', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      tm.toggle()
      expect(localStorage.getItem('pixelsnek-theme')).toBe('light')
    })

    it('applies new colors immediately after toggle', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      setPropertySpy.mockClear()
      tm.toggle()
      expect(setPropertySpy).toHaveBeenCalledWith('--bg', LIGHT.background)
    })
  })

  describe('_apply() CSS custom properties', () => {
    it('sets --bg on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--bg', DARK.background)
    })

    it('sets --text on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--text', DARK.text)
    })

    it('sets --text-secondary on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--text-secondary', DARK.textSecondary)
    })

    it('sets --panel-bg on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'light')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--panel-bg', LIGHT.panelBg)
    })

    it('sets --panel-border on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'light')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--panel-border', LIGHT.panelBorder)
    })

    it('sets --button-bg on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--button-bg', DARK.buttonBg)
    })

    it('sets --button-text on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--button-text', DARK.buttonText)
    })

    it('sets --button-hover on document.documentElement', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      new ThemeManager()
      expect(setPropertySpy).toHaveBeenCalledWith('--button-hover', DARK.buttonHover)
    })
  })

  describe('OS preference change listener', () => {
    it('updates colors when system preference and OS switches to light', () => {
      const tm = new ThemeManager()
      expect(tm.getColors()).toEqual(DARK)
      mockMediaQuery._trigger(false)
      expect(tm.getColors()).toEqual(LIGHT)
    })

    it('updates colors when system preference and OS switches to dark', () => {
      mockMediaQuery.matches = false
      const tm = new ThemeManager()
      expect(tm.getColors()).toEqual(LIGHT)
      mockMediaQuery._trigger(true)
      expect(tm.getColors()).toEqual(DARK)
    })

    it('does not change colors when preference is dark and OS changes', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      mockMediaQuery._trigger(false)
      expect(tm.getColors()).toEqual(DARK)
    })

    it('does not change colors when preference is light and OS changes', () => {
      localStorage.setItem('pixelsnek-theme', 'light')
      const tm = new ThemeManager()
      mockMediaQuery._trigger(true)
      expect(tm.getColors()).toEqual(LIGHT)
    })

    it('notifies onChange listeners when OS preference changes in system mode', () => {
      const tm = new ThemeManager()
      const cb = vi.fn()
      tm.onChange(cb)
      mockMediaQuery._trigger(false)
      expect(cb).toHaveBeenCalledWith(LIGHT)
    })

    it('does not notify onChange listeners when OS changes in non-system mode', () => {
      localStorage.setItem('pixelsnek-theme', 'dark')
      const tm = new ThemeManager()
      const cb = vi.fn()
      tm.onChange(cb)
      mockMediaQuery._trigger(false)
      expect(cb).not.toHaveBeenCalled()
    })
  })

  describe('destroy()', () => {
    it('removes matchMedia event listener', () => {
      const tm = new ThemeManager()
      tm.destroy()
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
