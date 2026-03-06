import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Settings, SettingsManager, SETTINGS_DEFAULTS } from '../Settings'

function mockLocalStorage(): { store: Record<string, string>; getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn>; removeItem: ReturnType<typeof vi.fn> } {
  const store: Record<string, string> = {}
  return {
    store,
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
  }
}

describe('Settings defaults', () => {
  it('gridWidth defaults to 20', () => {
    expect(SETTINGS_DEFAULTS.gridWidth).toBe(20)
  })

  it('gridHeight defaults to 20', () => {
    expect(SETTINGS_DEFAULTS.gridHeight).toBe(20)
  })

  it('initialSpeed defaults to 150', () => {
    expect(SETTINGS_DEFAULTS.initialSpeed).toBe(150)
  })

  it('showGrid defaults to true', () => {
    expect(SETTINGS_DEFAULTS.showGrid).toBe(true)
  })

  it('showParticles defaults to true', () => {
    expect(SETTINGS_DEFAULTS.showParticles).toBe(true)
  })

  it('controlScheme defaults to both', () => {
    expect(SETTINGS_DEFAULTS.controlScheme).toBe('both')
  })
})

describe('SettingsManager — construction', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads defaults when localStorage is empty', () => {
    const manager = new SettingsManager()
    const settings = manager.get()
    expect(settings).toEqual(SETTINGS_DEFAULTS)
  })

  it('returns a copy of settings from get()', () => {
    const manager = new SettingsManager()
    const a = manager.get()
    const b = manager.get()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('SettingsManager — load()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when no stored settings', () => {
    const manager = new SettingsManager()
    const settings = manager.load()
    expect(settings).toEqual(SETTINGS_DEFAULTS)
  })

  it('reads stored settings from localStorage', () => {
    localStorage.setItem('pixelsnek-settings', JSON.stringify({ gridWidth: 15, gridHeight: 12 }))
    const manager = new SettingsManager()
    const settings = manager.get()
    expect(settings.gridWidth).toBe(15)
    expect(settings.gridHeight).toBe(12)
  })

  it('merges stored settings with defaults', () => {
    localStorage.setItem('pixelsnek-settings', JSON.stringify({ gridWidth: 25 }))
    const manager = new SettingsManager()
    const settings = manager.get()
    expect(settings.gridWidth).toBe(25)
    expect(settings.gridHeight).toBe(SETTINGS_DEFAULTS.gridHeight)
    expect(settings.initialSpeed).toBe(SETTINGS_DEFAULTS.initialSpeed)
  })

  it('handles corrupt JSON gracefully by returning defaults', () => {
    localStorage.setItem('pixelsnek-settings', 'not-valid-json}}}')
    const manager = new SettingsManager()
    const settings = manager.get()
    expect(settings).toEqual(SETTINGS_DEFAULTS)
  })

  it('handles null localStorage value by returning defaults', () => {
    const ls = mockLocalStorage()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(ls.getItem)
    ls.getItem.mockReturnValue(null)
    const manager = new SettingsManager()
    expect(manager.get()).toEqual(SETTINGS_DEFAULTS)
    vi.restoreAllMocks()
  })
})

describe('SettingsManager — save()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('writes settings to localStorage', () => {
    const manager = new SettingsManager()
    manager.save()
    const raw = localStorage.getItem('pixelsnek-settings')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as Settings
    expect(parsed).toEqual(SETTINGS_DEFAULTS)
  })

  it('persists current settings so a new manager reads them back', () => {
    const manager = new SettingsManager()
    manager.update({ gridWidth: 30, showGrid: false })
    const manager2 = new SettingsManager()
    expect(manager2.get().gridWidth).toBe(30)
    expect(manager2.get().showGrid).toBe(false)
  })
})

describe('SettingsManager — update()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('merges partial settings into current settings', () => {
    const manager = new SettingsManager()
    manager.update({ gridWidth: 28 })
    expect(manager.get().gridWidth).toBe(28)
    expect(manager.get().gridHeight).toBe(SETTINGS_DEFAULTS.gridHeight)
  })

  it('saves after update', () => {
    const manager = new SettingsManager()
    manager.update({ showParticles: false })
    const raw = localStorage.getItem('pixelsnek-settings')
    const parsed = JSON.parse(raw!) as Settings
    expect(parsed.showParticles).toBe(false)
  })

  it('update with controlScheme persists', () => {
    const manager = new SettingsManager()
    manager.update({ controlScheme: 'arrows' })
    expect(manager.get().controlScheme).toBe('arrows')
  })

  it('update with empty object does not change settings', () => {
    const manager = new SettingsManager()
    manager.update({})
    expect(manager.get()).toEqual(SETTINGS_DEFAULTS)
  })
})

describe('SettingsManager — reset()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('restores all settings to defaults', () => {
    const manager = new SettingsManager()
    manager.update({ gridWidth: 30, showGrid: false, controlScheme: 'wasd', initialSpeed: 50 })
    manager.reset()
    expect(manager.get()).toEqual(SETTINGS_DEFAULTS)
  })

  it('persists defaults to localStorage after reset', () => {
    const manager = new SettingsManager()
    manager.update({ gridWidth: 30 })
    manager.reset()
    const raw = localStorage.getItem('pixelsnek-settings')
    const parsed = JSON.parse(raw!) as Settings
    expect(parsed.gridWidth).toBe(SETTINGS_DEFAULTS.gridWidth)
  })

  it('new manager after reset reads defaults', () => {
    const manager = new SettingsManager()
    manager.update({ showParticles: false, gridWidth: 12 })
    manager.reset()
    const manager2 = new SettingsManager()
    expect(manager2.get()).toEqual(SETTINGS_DEFAULTS)
  })
})

describe('SettingsManager — prototype pollution filtering', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ignores __proto__ key in stored JSON', () => {
    localStorage.setItem('pixelsnek-settings', '{"__proto__":{"polluted":true},"gridWidth":25}')
    const manager = new SettingsManager()
    expect(manager.get().gridWidth).toBe(25)
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined()
  })

  it('ignores constructor key in stored JSON', () => {
    localStorage.setItem('pixelsnek-settings', '{"constructor":{"polluted":true},"gridWidth":22}')
    const manager = new SettingsManager()
    expect(manager.get().gridWidth).toBe(22)
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined()
  })

  it('ignores prototype key in stored JSON', () => {
    localStorage.setItem('pixelsnek-settings', '{"prototype":{"polluted":true},"gridWidth":18}')
    const manager = new SettingsManager()
    expect(manager.get().gridWidth).toBe(18)
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined()
  })

  it('loads valid settings alongside filtered keys', () => {
    localStorage.setItem('pixelsnek-settings', '{"__proto__":{"evil":1},"showParticles":false,"gridWidth":15}')
    const manager = new SettingsManager()
    const s = manager.get()
    expect(s.showParticles).toBe(false)
    expect(s.gridWidth).toBe(15)
  })

  it('clamps gridWidth values from JSON to valid range', () => {
    localStorage.setItem('pixelsnek-settings', '{"gridWidth":999}')
    const manager = new SettingsManager()
    expect(manager.get().gridWidth).toBe(30)
  })

  it('clamps initialSpeed values from JSON to valid range', () => {
    localStorage.setItem('pixelsnek-settings', '{"initialSpeed":1}')
    const manager = new SettingsManager()
    expect(manager.get().initialSpeed).toBe(50)
  })
})
