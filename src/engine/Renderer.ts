import { Game } from '../game/Game'
import { GameState, Particle, Position } from '../game/types'
import { ThemeColors, ThemeManager, DARK } from '../ui/Theme'

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private displayWidth: number = 0
  private displayHeight: number = 0
  private cellSize: number = 0
  private gridWidth: number
  private gridHeight: number
  private colors: ThemeColors

  constructor(
    canvas: HTMLCanvasElement,
    gridWidth: number = 20,
    gridHeight: number = 20,
    themeManager: ThemeManager | null = null,
  ) {
    this.canvas = canvas
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.colors = themeManager ? themeManager.getColors() : DARK
    if (themeManager) {
      themeManager.onChange((colors) => {
        this.colors = colors
      })
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1
    const size = Math.min(window.innerWidth, window.innerHeight)
    this.displayWidth = size
    this.displayHeight = size
    this.canvas.width = Math.round(size * dpr)
    this.canvas.height = Math.round(size * dpr)
    this.canvas.style.width = `${size}px`
    this.canvas.style.height = `${size}px`
    this.canvas.style.position = 'absolute'
    this.canvas.style.left = `${Math.floor((window.innerWidth - size) / 2)}px`
    this.canvas.style.top = `${Math.floor((window.innerHeight - size) / 2)}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.cellSize = Math.floor(size / this.gridWidth)
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight)
  }

  renderBackground(): void {
    this.ctx.fillStyle = this.colors.background
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight)
  }

  renderGrid(): void {
    this.ctx.strokeStyle = this.colors.gridLine
    this.ctx.lineWidth = 1
    for (let x = 0; x <= this.gridWidth; x++) {
      const px = x * this.cellSize
      this.ctx.beginPath()
      this.ctx.moveTo(px, 0)
      this.ctx.lineTo(px, this.displayHeight)
      this.ctx.stroke()
    }
    for (let y = 0; y <= this.gridHeight; y++) {
      const py = y * this.cellSize
      this.ctx.beginPath()
      this.ctx.moveTo(0, py)
      this.ctx.lineTo(this.displayWidth, py)
      this.ctx.stroke()
    }
  }

  renderSnake(segments: Position[]): void {
    const gap = 0.5
    const radius = 3
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const isHead = i === segments.length - 1
      const x = seg.x * this.cellSize + gap
      const y = seg.y * this.cellSize + gap
      const size = this.cellSize - gap * 2
      this.ctx.fillStyle = isHead ? this.colors.snakeHead : this.colors.snakeBody
      this.ctx.beginPath()
      this.ctx.roundRect(x, y, size, size, radius)
      this.ctx.fill()
      if (isHead) {
        const eyeRadius = Math.max(1.5, size * 0.1)
        const eyeOffsetX = size * 0.25
        const eyeY = y + size * 0.3
        this.ctx.fillStyle = this.colors.background
        this.ctx.beginPath()
        this.ctx.arc(x + eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.beginPath()
        this.ctx.arc(x + size - eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }
  }

  renderFood(position: Position): void {
    const cx = position.x * this.cellSize + this.cellSize / 2
    const cy = position.y * this.cellSize + this.cellSize / 2
    const radius = this.cellSize * 0.35
    this.ctx.save()
    this.ctx.shadowBlur = 12
    this.ctx.shadowColor = this.colors.foodGlow
    this.ctx.fillStyle = this.colors.food
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
  }

  renderParticles(particles: Particle[]): void {
    for (const p of particles) {
      const alpha = p.alpha * (p.lifetime / p.maxLifetime)
      this.ctx.globalAlpha = alpha
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  render(game: Game): void {
    this.clear()
    this.renderBackground()
    this.renderGrid()
    if (game.state !== GameState.MENU) {
      this.renderFood(game.food.getPosition())
      this.renderSnake(game.snake.getSegments())
      this.renderParticles(game.particles)
    }
    if (game.state === GameState.PAUSED) {
      this._renderOverlay('PAUSED')
    } else if (game.state === GameState.GAME_OVER) {
      this._renderOverlay(`GAME OVER  score: ${game.score}`)
    } else if (game.state === GameState.MENU) {
      this._renderOverlay('PRESS ENTER TO START')
    }
  }

  private _renderOverlay(text: string): void {
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)'
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = `bold ${Math.max(16, Math.floor(this.cellSize * 1.2))}px system-ui`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text, this.displayWidth / 2, this.displayHeight / 2)
  }
}
