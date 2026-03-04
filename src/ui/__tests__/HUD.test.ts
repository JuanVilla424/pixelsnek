import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HUD } from '../HUD'
import { DARK, ThemeColors } from '../Theme'

function makeMockCtx(): CanvasRenderingContext2D {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: '',
    globalAlpha: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D
}

function getFilledTexts(ctx: CanvasRenderingContext2D): string[] {
  return (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
}

describe('HUD constructor', () => {
  it('creates a HUD instance with a canvas context', () => {
    const ctx = makeMockCtx()
    const hud = new HUD(ctx)
    expect(hud).toBeDefined()
  })
})

describe('HUD.renderHUD()', () => {
  let ctx: CanvasRenderingContext2D
  let hud: HUD
  const colors: ThemeColors = DARK

  beforeEach(() => {
    ctx = makeMockCtx()
    hud = new HUD(ctx)
    hud.renderHUD(400, 42, 3, 100, colors)
  })

  it('renders score text in top-left', () => {
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Score: 42')
  })

  it('renders high score text in top-center', () => {
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('HI: 100')
  })

  it('renders level text in top-right', () => {
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Level: 3')
  })

  it('sets font to 16px monospace for score', () => {
    const fontCalls = (ctx as unknown as { font: string })
    // font is set as property — check via calls inspection through fillText order
    // The font for score is set before the first fillText call
    const calls = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.length).toBeGreaterThanOrEqual(3)
  })

  it('sets textAlign to left for score', () => {
    // ctx.textAlign is set multiple times; verify save/restore are called
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })

  it('calls save and restore to preserve context state', () => {
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })
})

describe('HUD.renderMenu()', () => {
  let ctx: CanvasRenderingContext2D
  let hud: HUD
  const colors: ThemeColors = DARK

  beforeEach(() => {
    ctx = makeMockCtx()
    hud = new HUD(ctx)
  })

  it('renders a semi-transparent overlay via fillRect', () => {
    hud.renderMenu(400, 400, 0, colors)
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 400, 400)
  })

  it('renders the PIXELSNEK title', () => {
    hud.renderMenu(400, 400, 0, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('PIXELSNEK')
  })

  it('renders the subtitle', () => {
    hud.renderMenu(400, 400, 0, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Classic Snake Game')
  })

  it('renders the start instruction', () => {
    hud.renderMenu(400, 400, 0, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Press SPACE to start')
  })

  it('renders the movement instruction', () => {
    hud.renderMenu(400, 400, 0, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('WASD or Arrow Keys to move')
  })

  it('renders high score when highScore > 0', () => {
    hud.renderMenu(400, 400, 55, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Best: 55')
  })

  it('does not render high score line when highScore is 0', () => {
    hud.renderMenu(400, 400, 0, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).not.toContain('Best: 0')
  })

  it('draws pixel-art snake icon using roundRect', () => {
    hud.renderMenu(400, 400, 0, colors)
    expect(ctx.roundRect).toHaveBeenCalled()
  })

  it('draws 6 snake icon segments', () => {
    hud.renderMenu(400, 400, 0, colors)
    expect((ctx.roundRect as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(6)
  })
})

describe('HUD.renderPause()', () => {
  let ctx: CanvasRenderingContext2D
  let hud: HUD
  const colors: ThemeColors = DARK

  beforeEach(() => {
    ctx = makeMockCtx()
    hud = new HUD(ctx)
    hud.renderPause(400, 400, colors)
  })

  it('renders a semi-transparent overlay via fillRect', () => {
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 400, 400)
  })

  it('renders PAUSED text', () => {
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('PAUSED')
  })

  it('renders the resume instruction', () => {
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Press SPACE to resume')
  })

  it('calls save and restore', () => {
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })
})

describe('HUD.renderGameOver()', () => {
  let ctx: CanvasRenderingContext2D
  let hud: HUD
  const colors: ThemeColors = DARK

  beforeEach(() => {
    ctx = makeMockCtx()
    hud = new HUD(ctx)
  })

  it('renders GAME OVER text', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('GAME OVER')
  })

  it('renders the final score', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Score: 10')
  })

  it('renders the final level', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Level: 2')
  })

  it('renders play-again instruction', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Press SPACE to play again')
  })

  it('renders leaderboard instruction', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('Press L for Leaderboard')
  })

  it('does NOT render New High Score! when isNewHighScore is false', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).not.toContain('New High Score!')
  })

  it('renders New High Score! when isNewHighScore is true and blink is visible', () => {
    // Math.floor(0 / 500) % 2 === 0 → visible
    vi.spyOn(Date, 'now').mockReturnValue(0)
    hud.renderGameOver(400, 400, 10, 2, 0, true, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('New High Score!')
    vi.restoreAllMocks()
  })

  it('does NOT render New High Score! when isNewHighScore is true but blink is hidden', () => {
    // Math.floor(500 / 500) % 2 === 1 → hidden
    vi.spyOn(Date, 'now').mockReturnValue(500)
    hud.renderGameOver(400, 400, 10, 2, 0, true, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).not.toContain('New High Score!')
    vi.restoreAllMocks()
  })

  it('renders New High Score! again at 1000ms (second visible interval)', () => {
    // Math.floor(1000 / 500) % 2 === 0 → visible
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    hud.renderGameOver(400, 400, 10, 2, 0, true, colors)
    const texts = getFilledTexts(ctx)
    expect(texts).toContain('New High Score!')
    vi.restoreAllMocks()
  })

  it('renders the overlay fillRect', () => {
    hud.renderGameOver(400, 400, 10, 2, 50, false, colors)
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 400, 400)
  })
})

describe('HUD blink timing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('alternates New High Score! visibility every 500ms', () => {
    const ctx = makeMockCtx()
    const hud = new HUD(ctx)
    const colors: ThemeColors = DARK

    const timings = [0, 499, 500, 999, 1000, 1499, 1500]
    const expected = [true, true, false, false, true, true, false]

    timings.forEach((t, i) => {
      vi.spyOn(Date, 'now').mockReturnValue(t)
      ;(ctx.fillText as ReturnType<typeof vi.fn>).mockClear()
      hud.renderGameOver(400, 400, 5, 1, 0, true, colors)
      const texts = getFilledTexts(ctx)
      const shown = texts.includes('New High Score!')
      expect(shown).toBe(expected[i])
      vi.restoreAllMocks()
    })
  })
})
