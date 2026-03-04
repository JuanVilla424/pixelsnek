const STORAGE_KEY = 'pixelsnek-settings'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  return e
}

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
      const merged = { ...SETTINGS_DEFAULTS, ...parsed }
      return {
        gridWidth: Math.min(30, Math.max(12, Math.floor(Number(merged.gridWidth)) || SETTINGS_DEFAULTS.gridWidth)),
        gridHeight: Math.min(30, Math.max(12, Math.floor(Number(merged.gridHeight)) || SETTINGS_DEFAULTS.gridHeight)),
        initialSpeed: Math.min(200, Math.max(50, Math.floor(Number(merged.initialSpeed)) || SETTINGS_DEFAULTS.initialSpeed)),
        showGrid: Boolean(merged.showGrid),
        showParticles: Boolean(merged.showParticles),
        controlScheme: (['arrows', 'wasd', 'both'] as const).includes(merged.controlScheme as Settings['controlScheme'])
          ? (merged.controlScheme as Settings['controlScheme'])
          : SETTINGS_DEFAULTS.controlScheme,
      }
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

export interface SettingsPanelCallbacks {
  onApply: (settings: Settings) => void
  onClose: () => void
}

export class SettingsPanel {
  private overlay: HTMLDivElement | null = null
  private escHandler: ((e: KeyboardEvent) => void) | null = null

  open(current: Settings, callbacks: SettingsPanelCallbacks): void {
    if (this.overlay) return
    const draft = { ...current }
    const overlay = el('div', 'settings-overlay')
    const panel = el('div', 'settings-panel')

    const h2 = el('h2')
    h2.textContent = 'Settings'
    panel.appendChild(h2)

    // Grid Size
    const gridSec = el('div', 'settings-section')
    const gridTitle = el('div', 'settings-section-title')
    gridTitle.textContent = 'Grid Size'
    gridSec.appendChild(gridTitle)

    const wRow = el('div', 'settings-row')
    const wLabel = el('label')
    wLabel.textContent = 'Width'
    const wWrap = el('div', 'settings-slider-wrap')
    const wSlider = el('input')
    wSlider.type = 'range'
    wSlider.min = '12'
    wSlider.max = '30'
    wSlider.value = String(draft.gridWidth)
    const wVal = el('span', 'settings-value')
    wVal.textContent = String(draft.gridWidth)
    wSlider.addEventListener('input', () => {
      draft.gridWidth = parseInt(wSlider.value, 10)
      wVal.textContent = wSlider.value
    })
    wWrap.appendChild(wSlider)
    wWrap.appendChild(wVal)
    wRow.appendChild(wLabel)
    wRow.appendChild(wWrap)
    gridSec.appendChild(wRow)

    const hRow = el('div', 'settings-row')
    const hLabel = el('label')
    hLabel.textContent = 'Height'
    const hWrap = el('div', 'settings-slider-wrap')
    const hSlider = el('input')
    hSlider.type = 'range'
    hSlider.min = '12'
    hSlider.max = '30'
    hSlider.value = String(draft.gridHeight)
    const hVal = el('span', 'settings-value')
    hVal.textContent = String(draft.gridHeight)
    hSlider.addEventListener('input', () => {
      draft.gridHeight = parseInt(hSlider.value, 10)
      hVal.textContent = hSlider.value
    })
    hWrap.appendChild(hSlider)
    hWrap.appendChild(hVal)
    hRow.appendChild(hLabel)
    hRow.appendChild(hWrap)
    gridSec.appendChild(hRow)
    panel.appendChild(gridSec)

    // Starting Speed (inverted: left=slow=200ms, right=fast=50ms)
    const speedSec = el('div', 'settings-section')
    const speedTitle = el('div', 'settings-section-title')
    speedTitle.textContent = 'Starting Speed'
    speedSec.appendChild(speedTitle)
    const speedRow = el('div', 'settings-row')
    const speedWrap = el('div', 'settings-slider-wrap')
    const speedSlider = el('input')
    speedSlider.type = 'range'
    speedSlider.min = '50'
    speedSlider.max = '200'
    speedSlider.value = String(250 - draft.initialSpeed)
    speedSlider.addEventListener('input', () => {
      draft.initialSpeed = 250 - parseInt(speedSlider.value, 10)
    })
    speedWrap.appendChild(speedSlider)
    speedRow.appendChild(speedWrap)
    speedSec.appendChild(speedRow)
    const speedLabels = el('div', 'settings-speed-labels')
    const slowSpan = el('span')
    slowSpan.textContent = 'Slow'
    const fastSpan = el('span')
    fastSpan.textContent = 'Fast'
    speedLabels.appendChild(slowSpan)
    speedLabels.appendChild(fastSpan)
    speedSec.appendChild(speedLabels)
    panel.appendChild(speedSec)

    // Visuals
    const visualSec = el('div', 'settings-section')
    const visualTitle = el('div', 'settings-section-title')
    visualTitle.textContent = 'Visuals'
    visualSec.appendChild(visualTitle)

    const gridChkRow = el('label', 'settings-checkbox-row')
    const gridChk = el('input')
    gridChk.type = 'checkbox'
    gridChk.checked = draft.showGrid
    const gridChkLabel = el('span')
    gridChkLabel.textContent = 'Show Grid Lines'
    gridChk.addEventListener('change', () => {
      draft.showGrid = gridChk.checked
    })
    gridChkRow.appendChild(gridChk)
    gridChkRow.appendChild(gridChkLabel)
    visualSec.appendChild(gridChkRow)

    const ptChkRow = el('label', 'settings-checkbox-row')
    const ptChk = el('input')
    ptChk.type = 'checkbox'
    ptChk.checked = draft.showParticles
    const ptChkLabel = el('span')
    ptChkLabel.textContent = 'Show Particles'
    ptChk.addEventListener('change', () => {
      draft.showParticles = ptChk.checked
    })
    ptChkRow.appendChild(ptChk)
    ptChkRow.appendChild(ptChkLabel)
    visualSec.appendChild(ptChkRow)
    panel.appendChild(visualSec)

    // Control Scheme
    const ctrlSec = el('div', 'settings-section')
    const ctrlTitle = el('div', 'settings-section-title')
    ctrlTitle.textContent = 'Control Scheme'
    ctrlSec.appendChild(ctrlTitle)
    const radioGroup = el('div', 'settings-radio-group')
    const schemes: Array<{ value: Settings['controlScheme']; label: string }> = [
      { value: 'arrows', label: 'Arrows Only' },
      { value: 'wasd', label: 'WASD Only' },
      { value: 'both', label: 'Both' },
    ]
    const radios: HTMLInputElement[] = []
    for (const scheme of schemes) {
      const radioRow = el('label', 'settings-radio-row')
      const radio = el('input')
      radio.type = 'radio'
      radio.name = 'controlScheme'
      radio.value = scheme.value
      radio.checked = draft.controlScheme === scheme.value
      const radioLabel = el('span')
      radioLabel.textContent = scheme.label
      radio.addEventListener('change', () => {
        if (radio.checked) draft.controlScheme = scheme.value
      })
      radios.push(radio)
      radioRow.appendChild(radio)
      radioRow.appendChild(radioLabel)
      radioGroup.appendChild(radioRow)
    }
    ctrlSec.appendChild(radioGroup)
    panel.appendChild(ctrlSec)

    // Buttons
    const btnRow = el('div', 'settings-buttons')
    const applyBtn = el('button', 'settings-btn-apply')
    applyBtn.textContent = 'Apply & Close'
    applyBtn.addEventListener('click', () => {
      callbacks.onApply({ ...draft })
      this.close()
    })
    const resetBtn = el('button', 'settings-btn-reset')
    resetBtn.textContent = 'Reset Defaults'
    resetBtn.addEventListener('click', () => {
      const d = SETTINGS_DEFAULTS
      wSlider.value = String(d.gridWidth)
      wVal.textContent = String(d.gridWidth)
      hSlider.value = String(d.gridHeight)
      hVal.textContent = String(d.gridHeight)
      speedSlider.value = String(250 - d.initialSpeed)
      gridChk.checked = d.showGrid
      ptChk.checked = d.showParticles
      for (const r of radios) r.checked = r.value === d.controlScheme
      Object.assign(draft, d)
    })
    btnRow.appendChild(applyBtn)
    btnRow.appendChild(resetBtn)
    panel.appendChild(btnRow)

    overlay.appendChild(panel)
    document.body.appendChild(overlay)
    this.overlay = overlay

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        callbacks.onClose()
        this.close()
      }
    })
    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callbacks.onClose()
        this.close()
      }
    }
    window.addEventListener('keydown', this.escHandler)
  }

  close(): void {
    this.overlay?.remove()
    this.overlay = null
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler)
      this.escHandler = null
    }
  }

  isOpen(): boolean {
    return this.overlay !== null
  }
}
