import { ThemeColors } from './Theme'

export class HUD {
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  renderHUD(displayWidth: number, score: number, level: number, highScore: number, colors: ThemeColors): void {
    const padding = 12
    const ctx = this.ctx

    ctx.save()
    ctx.textBaseline = 'top'

    ctx.fillStyle = colors.text
    ctx.font = '16px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`Score: ${score}`, padding, padding)

    ctx.fillStyle = colors.text
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`HI: ${highScore}`, displayWidth / 2, padding)

    ctx.fillStyle = colors.text
    ctx.font = '16px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`Level: ${level}`, displayWidth - padding, padding)

    ctx.restore()
  }

  renderMenu(displayWidth: number, displayHeight: number, highScore: number, colors: ThemeColors): void {
    const ctx = this.ctx
    const cx = displayWidth / 2
    const cy = displayHeight / 2

    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    ctx.save()
    const scale = 1 + 0.03 * Math.sin(Date.now() / 400)
    ctx.translate(cx, cy - 90)
    ctx.scale(scale, scale)
    ctx.fillStyle = colors.snakeHead
    ctx.font = 'bold 48px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('PIXELSNEK', 0, 0)
    ctx.restore()

    ctx.fillStyle = colors.textSecondary
    ctx.font = '18px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Classic Snake Game', cx, cy - 44)

    this._renderSnakeIcon(cx, cy - 10, colors)

    ctx.fillStyle = colors.text
    ctx.font = '14px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Press SPACE to start', cx, cy + 32)

    ctx.fillStyle = colors.textSecondary
    ctx.font = '14px monospace'
    ctx.fillText('WASD or Arrow Keys to move', cx, cy + 54)

    if (highScore > 0) {
      ctx.fillStyle = colors.textSecondary
      ctx.font = '14px monospace'
      ctx.fillText(`Best: ${highScore}`, cx, cy + 80)
    }

    ctx.restore()
  }

  renderPause(displayWidth: number, displayHeight: number, colors: ThemeColors): void {
    const ctx = this.ctx
    const cx = displayWidth / 2
    const cy = displayHeight / 2

    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    ctx.fillStyle = colors.text
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('PAUSED', cx, cy - 20)

    ctx.fillStyle = colors.textSecondary
    ctx.font = '14px monospace'
    ctx.fillText('Press SPACE to resume', cx, cy + 20)

    ctx.restore()
  }

  renderGameOver(
    displayWidth: number,
    displayHeight: number,
    score: number,
    level: number,
    _highScore: number,
    isNewHighScore: boolean,
    colors: ThemeColors,
  ): void {
    const ctx = this.ctx
    const cx = displayWidth / 2
    const cy = displayHeight / 2

    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = '#f87171'
    ctx.font = 'bold 42px monospace'
    ctx.fillText('GAME OVER', cx, cy - 80)

    ctx.fillStyle = colors.text
    ctx.font = '24px monospace'
    ctx.fillText(`Score: ${score}`, cx, cy - 28)

    ctx.fillStyle = colors.textSecondary
    ctx.font = '18px monospace'
    ctx.fillText(`Level: ${level}`, cx, cy + 6)

    if (isNewHighScore && Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 18px monospace'
      ctx.fillText('New High Score!', cx, cy + 38)
    }

    ctx.fillStyle = colors.textSecondary
    ctx.font = '14px monospace'
    ctx.fillText('Press SPACE to play again', cx, cy + 70)
    ctx.fillText('Press L for Leaderboard', cx, cy + 92)

    ctx.restore()
  }

  renderTouchHint(displayWidth: number, displayHeight: number, alpha: number, colors: ThemeColors): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha = alpha * 0.75
    ctx.fillStyle = colors.text
    ctx.font = '18px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Swipe to move', displayWidth / 2, displayHeight / 2)
    ctx.restore()
  }

  private _renderSnakeIcon(cx: number, cy: number, colors: ThemeColors): void {
    const ctx = this.ctx
    const size = 10
    const step = 12
    const segments = [
      { x: -2, y: -1 },
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]

    ctx.save()
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const px = cx + seg.x * step - size / 2
      const py = cy + seg.y * step - size / 2
      ctx.fillStyle = i === segments.length - 1 ? colors.snakeHead : colors.snakeBody
      ctx.beginPath()
      ctx.roundRect(px, py, size, size, 2)
      ctx.fill()
    }
    ctx.restore()
  }
}
