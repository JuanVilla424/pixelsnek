import { ThemeColors } from './Theme'

export interface LeaderboardEntry {
  name: string
  score: number
  level: number
  date: string
}

const STORAGE_KEY = 'pixelsnek-leaderboard'
const MAX_ENTRIES = 10

export class Leaderboard {
  private activeInput: HTMLInputElement | null = null

  getEntries(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      const entries: LeaderboardEntry[] = parsed
        .filter(
          (e): e is Record<string, unknown> =>
            typeof e === 'object' && e !== null && !Array.isArray(e),
        )
        .map((e) => ({
          name: String(e['name'] ?? 'Player').slice(0, 20),
          score: Math.max(0, Math.floor(Number(e['score']) || 0)),
          level: Math.max(1, Math.floor(Number(e['level']) || 1)),
          date: typeof e['date'] === 'string' && !isNaN(Date.parse(e['date'] as string)) ? (e['date'] as string) : new Date().toISOString(),
        }))
      return entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)
    } catch {
      return []
    }
  }

  addEntry(entry: LeaderboardEntry): void {
    const sanitized: LeaderboardEntry = {
      name: String(entry.name ?? 'Player').slice(0, 20),
      score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      level: Math.max(1, Math.floor(Number(entry.level) || 1)),
      date: typeof entry.date === 'string' && !isNaN(Date.parse(entry.date)) ? entry.date : new Date().toISOString(),
    }
    const entries = this.getEntries()
    entries.push(sanitized)
    const sorted = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  }

  isHighScore(score: number): boolean {
    const entries = this.getEntries()
    if (entries.length < MAX_ENTRIES) return true
    return score > entries[entries.length - 1].score
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  showNameInput(
    canvas: HTMLCanvasElement,
    colors: ThemeColors,
    onSubmit: (name: string) => void,
  ): void {
    if (this.activeInput) return

    const input = document.createElement('input')
    input.type = 'text'
    input.maxLength = 10
    input.placeholder = 'Your name'
    input.autocomplete = 'off'

    const rect = canvas.getBoundingClientRect()
    input.style.position = 'fixed'
    input.style.left = `${rect.left + rect.width / 2}px`
    input.style.top = `${rect.top + rect.height / 2}px`
    input.style.transform = 'translate(-50%, -50%)'
    input.style.zIndex = '1000'
    input.style.background = colors.panelBg
    input.style.color = colors.text
    input.style.border = `2px solid ${colors.panelBorder}`
    input.style.borderRadius = '6px'
    input.style.padding = '10px 16px'
    input.style.fontSize = '16px'
    input.style.fontFamily = 'system-ui, sans-serif'
    input.style.outline = 'none'
    input.style.width = '180px'
    input.style.textAlign = 'center'
    input.style.boxSizing = 'border-box'

    const remove = (): void => {
      if (input.parentNode) input.parentNode.removeChild(input)
      this.activeInput = null
    }

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const name = input.value.trim() || 'Player'
        remove()
        onSubmit(name)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        remove()
      }
    })

    document.body.appendChild(input)
    this.activeInput = input
    input.focus()
  }

  hideNameInput(): void {
    if (this.activeInput) {
      if (this.activeInput.parentNode) {
        this.activeInput.parentNode.removeChild(this.activeInput)
      }
      this.activeInput = null
    }
  }

  renderPanel(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: ThemeColors,
    highlightIndex?: number,
    clearConfirmPending?: boolean,
  ): void {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, width, height)

    const panelW = Math.min(width * 0.85, 520)
    const panelH = Math.min(height * 0.85, 480)
    const panelX = (width - panelW) / 2
    const panelY = (height - panelH) / 2

    ctx.fillStyle = colors.panelBg
    ctx.strokeStyle = colors.panelBorder
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(panelX, panelY, panelW, panelH, 8)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = colors.text
    ctx.font = 'bold 32px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('LEADERBOARD', width / 2, panelY + 20)

    const entries = this.getEntries()
    const tableTop = panelY + 68
    const rowH = 30

    const colRank = panelX + 28
    const colName = panelX + 76
    const colScore = panelX + panelW * 0.55
    const colLevel = panelX + panelW * 0.72
    const colDate = panelX + panelW - 16

    ctx.fillStyle = colors.textSecondary
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('RANK', colRank, tableTop)
    ctx.fillText('NAME', colName, tableTop)
    ctx.textAlign = 'right'
    ctx.fillText('SCORE', colScore, tableTop)
    ctx.fillText('LVL', colLevel, tableTop)
    ctx.fillText('DATE', colDate, tableTop)

    ctx.strokeStyle = colors.panelBorder
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(panelX + 12, tableTop + 16)
    ctx.lineTo(panelX + panelW - 12, tableTop + 16)
    ctx.stroke()

    const rowTop = tableTop + 22
    const displayCount = entries.length > 0 ? entries.length : 1

    for (let i = 0; i < displayCount; i++) {
      const ry = rowTop + i * rowH

      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(panelX + 4, ry - 2, panelW - 8, rowH)
      }

      if (i === highlightIndex) {
        ctx.fillStyle = 'rgba(74,222,128,0.15)'
        ctx.fillRect(panelX + 4, ry - 2, panelW - 8, rowH)
      }

      if (i < entries.length) {
        const entry = entries[i]
        const isHighlighted = i === highlightIndex
        ctx.fillStyle = isHighlighted ? colors.snakeHead : colors.text
        ctx.font = `${i === 0 ? 'bold ' : ''}14px system-ui`

        ctx.textAlign = 'left'
        ctx.fillText(`#${i + 1}`, colRank, ry + 4)
        ctx.fillText(entry.name, colName, ry + 4)

        ctx.textAlign = 'right'
        ctx.fillText(String(entry.score), colScore, ry + 4)
        ctx.fillText(String(entry.level), colLevel, ry + 4)

        const d = new Date(entry.date)
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
        ctx.fillText(dateStr, colDate, ry + 4)
      } else {
        ctx.fillStyle = colors.textSecondary
        ctx.font = '14px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('No entries yet', width / 2, ry + 4)
      }
    }

    ctx.fillStyle = colors.textSecondary
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Press ESC to close', width / 2, panelY + panelH - 30)

    if (entries.length > 0) {
      ctx.fillStyle = clearConfirmPending ? colors.food : colors.textSecondary
      ctx.font = '11px system-ui'
      ctx.fillText(
        clearConfirmPending
          ? 'Press C again to confirm clearing the leaderboard'
          : 'Press C to clear leaderboard',
        width / 2,
        panelY + panelH - 12,
      )
    }
  }
}
