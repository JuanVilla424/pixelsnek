const STORAGE_KEY = 'pixelsnek-settings'

export interface Settings {
  gridWidth: number
  gridHeight: number
  initialSpeed: number
  showGrid: boolean
  showParticles: boolean
  controlScheme: 'arrows' | 'wasd' | 'both'
}

export const SETTINGS_DEFAULTS: Settings = {
  gridWidth: 20,
  gridHeight: 20,
  initialSpeed: 150,
  showGrid: true,
  showParticles: true,
  controlScheme: 'both',
}

export class SettingsManager {
  private current: Settings

  constructor() {
    this.current = this.load()
  }

  load(): Settings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { ...SETTINGS_DEFAULTS }
      const parsed = JSON.parse(raw) as Partial<Settings>
      return { ...SETTINGS_DEFAULTS, ...parsed }
    } catch {
      return { ...SETTINGS_DEFAULTS }
    }
  }

  save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current))
  }

  get(): Settings {
    return { ...this.current }
  }

  update(partial: Partial<Settings>): void {
    this.current = { ...this.current, ...partial }
    this.save()
  }

  reset(): void {
    this.current = { ...SETTINGS_DEFAULTS }
    this.save()
  }
}
