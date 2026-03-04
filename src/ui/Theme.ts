export interface ThemeColors {
  background: string
  gridLine: string
  snakeHead: string
  snakeBody: string
  food: string
  foodGlow: string
  text: string
  textSecondary: string
  panelBg: string
  panelBorder: string
  buttonBg: string
  buttonText: string
  buttonHover: string
}

export const DARK: ThemeColors = {
  background: '#0a0a0f',
  gridLine: 'rgba(255,255,255,0.05)',
  snakeHead: '#4ade80',
  snakeBody: '#22c55e',
  food: '#f43f5e',
  foodGlow: '#f43f5e',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  panelBg: 'rgba(15,15,25,0.95)',
  panelBorder: 'rgba(255,255,255,0.1)',
  buttonBg: '#1e293b',
  buttonText: '#e2e8f0',
  buttonHover: '#334155',
}

export const LIGHT: ThemeColors = {
  background: '#f8fafc',
  gridLine: 'rgba(0,0,0,0.06)',
  snakeHead: '#16a34a',
  snakeBody: '#22c55e',
  food: '#dc2626',
  foodGlow: '#dc2626',
  text: '#1e293b',
  textSecondary: '#64748b',
  panelBg: 'rgba(255,255,255,0.95)',
  panelBorder: 'rgba(0,0,0,0.1)',
  buttonBg: '#e2e8f0',
  buttonText: '#1e293b',
  buttonHover: '#cbd5e1',
}

export type ThemePreference = 'dark' | 'light' | 'system'

type ThemeSetting = ThemePreference

export const DARK_THEME: ThemeColors = DARK
export const LIGHT_THEME: ThemeColors = LIGHT

const STORAGE_KEY = 'pixelsnek-theme'

export class ThemeManager {
  private setting: ThemeSetting
  private mediaQuery: MediaQueryList
  private listeners: Array<(colors: ThemeColors) => void> = []
  private _onMediaChange: () => void

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeSetting | null
    this.setting = stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system'
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this._onMediaChange = () => {
      if (this.setting === 'system') {
        this._apply()
      }
    }
    this.mediaQuery.addEventListener('change', this._onMediaChange)
    this._apply()
  }

  getColors(): ThemeColors {
    return this._resolveColors()
  }

  getSetting(): ThemeSetting {
    return this.setting
  }

  getPreference(): ThemePreference {
    return this.setting
  }

  toggle(): void {
    const order: ThemeSetting[] = ['dark', 'light', 'system']
    const idx = order.indexOf(this.setting)
    this.setting = order[(idx + 1) % order.length]
    localStorage.setItem(STORAGE_KEY, this.setting)
    this._apply()
  }

  onChange(cb: (colors: ThemeColors) => void): void {
    this.listeners.push(cb)
  }

  destroy(): void {
    this.mediaQuery.removeEventListener('change', this._onMediaChange)
  }

  private _resolveColors(): ThemeColors {
    if (this.setting === 'dark') return DARK
    if (this.setting === 'light') return LIGHT
    return this.mediaQuery.matches ? DARK : LIGHT
  }

  private _apply(): void {
    const colors = this._resolveColors()
    const root = document.documentElement
    root.style.setProperty('--bg', colors.background)
    root.style.setProperty('--text', colors.text)
    root.style.setProperty('--text-secondary', colors.textSecondary)
    root.style.setProperty('--panel-bg', colors.panelBg)
    root.style.setProperty('--panel-border', colors.panelBorder)
    root.style.setProperty('--button-bg', colors.buttonBg)
    root.style.setProperty('--button-text', colors.buttonText)
    root.style.setProperty('--button-hover', colors.buttonHover)
    for (const cb of this.listeners) {
      cb(colors)
    }
  }
}

function themeIcon(pref: ThemePreference): string {
  if (pref === 'dark') return '🌙'
  if (pref === 'light') return '☀️'
  return '🖥️'
}

export function createThemeToggle(themeManager: ThemeManager): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.id = 'theme-toggle'
  btn.setAttribute('aria-label', 'Toggle theme')
  btn.textContent = themeIcon(themeManager.getPreference())
  btn.addEventListener('click', () => {
    themeManager.toggle()
    btn.textContent = themeIcon(themeManager.getPreference())
  })
  themeManager.onChange(() => {
    btn.textContent = themeIcon(themeManager.getPreference())
  })
  document.body.appendChild(btn)
  return btn
}
