import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Game } from '../../game/Game'
import { Renderer } from '../Renderer'
import { DARK, ThemeColors, ThemeManager } from '../../ui/Theme'

function makeMockThemeManager(): ThemeManager {
  return {
    getColors: vi.fn((): ThemeColors => DARK),
    getSetting: vi.fn(() => 'dark' as const),
    getPreference: vi.fn(() => 'dark' as const),
    toggle: vi.fn(),
    onChange: vi.fn(),
    destroy: vi.fn(),
  } as unknown as ThemeManager
}

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

function makeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  return canvas
}

function makeRenderer(
  gridWidth = 20,
  gridHeight = 20,
): { renderer: Renderer; ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement; themeManager: ThemeManager } {
  const canvas = makeCanvas()
  const ctx = makeMockCtx()
  vi.spyOn(canvas, 'getContext').mockReturnValue(ctx)
  const themeManager = makeMockThemeManager()
  const renderer = new Renderer(canvas, gridWidth, gridHeight, themeManager)
  return { renderer, ctx, canvas, themeManager }
}

describe('Renderer constructor', () => {
  it('accepts a canvas element and creates renderer', () => {
    const { renderer } = makeRenderer()
    expect(renderer).toBeDefined()
  })

  it('throws if canvas context cannot be obtained', () => {
    const canvas = makeCanvas()
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    expect(() => new Renderer(canvas)).toThrow('Failed to get 2D context')
  })

  it('calls setTransform on construction for HiDPI scaling', () => {
    const { ctx } = makeRenderer()
    expect(ctx.setTransform).toHaveBeenCalled()
  })

  it('calls themeManager.getColors() during construction', () => {
    const { themeManager } = makeRenderer()
    expect(themeManager.getColors).toHaveBeenCalled()
  })

  it('registers onChange listener with themeManager', () => {
    const { themeManager } = makeRenderer()
    expect(themeManager.onChange).toHaveBeenCalledWith(expect.any(Function))
  })
})

describe('Renderer.resize()', () => {
  it('sets canvas width and height scaled by devicePixelRatio', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true })

    const { canvas } = makeRenderer()
    const expectedSize = Math.min(800, 600) // 600
    expect(canvas.width).toBe(Math.round(expectedSize * 2))
    expect(canvas.height).toBe(Math.round(expectedSize * 2))
  })

  it('sets canvas CSS style width and height to display size', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })

    const { canvas } = makeRenderer()
    expect(canvas.style.width).toBe('500px')
    expect(canvas.style.height).toBe('500px')
  })

  it('portrait orientation: canvas size = innerWidth (narrower dimension)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true })

    const { canvas } = makeRenderer()
    // In portrait, innerWidth < innerHeight, so size = innerWidth
    expect(canvas.style.width).toBe('375px')
    expect(canvas.style.height).toBe('375px')
  })

  it('landscape orientation: canvas size = innerHeight (shorter dimension)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 844, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 390, configurable: true })

    const { canvas } = makeRenderer()
    // In landscape, innerHeight < innerWidth, so size = innerHeight
    expect(canvas.style.width).toBe('390px')
    expect(canvas.style.height).toBe('390px')
  })

  it('landscape: canvas is centered horizontally via left offset', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 844, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 390, configurable: true })

    const { canvas } = makeRenderer()
    const size = 390
    const expectedLeft = Math.floor((844 - size) / 2)
    expect(canvas.style.left).toBe(`${expectedLeft}px`)
  })

  it('portrait: canvas is centered vertically via top offset', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true })

    const { canvas } = makeRenderer()
    const size = 375
    const expectedTop = Math.floor((812 - size) / 2)
    expect(canvas.style.top).toBe(`${expectedTop}px`)
  })

  it('portrait: canvas height derived from grid aspect ratio (non-square grid)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true })

    // 10x20 grid: aspectRatio = 10/20 = 0.5
    // portrait: displayWidth=375, displayHeight=Math.round(375/0.5)=750, 750 < 812 no clamp
    const { canvas } = makeRenderer(10, 20)
    expect(canvas.style.width).toBe('375px')
    expect(canvas.style.height).toBe('750px')
  })

  it('landscape: canvas width derived from grid aspect ratio (non-square grid)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 844, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 390, configurable: true })

    // 40x20 grid: aspectRatio = 40/20 = 2.0
    // landscape: displayHeight=390, displayWidth=Math.round(390*2)=780, 780 < 844 no clamp
    const { canvas } = makeRenderer(40, 20)
    expect(canvas.style.width).toBe('780px')
    expect(canvas.style.height).toBe('390px')
  })

  it('portrait: height clamped to viewport when grid displayHeight would exceed innerHeight', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 200, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 375, configurable: true })

    // 10x40 grid: aspectRatio = 10/40 = 0.25, portrait (vw=200 < vh=375)
    // displayWidth=200, displayHeight=Math.round(200/0.25)=800 > 375
    // clamped: displayHeight=375, displayWidth=Math.round(375*0.25)=94
    const { canvas } = makeRenderer(10, 40)
    expect(canvas.style.height).toBe('375px')
    expect(canvas.style.width).toBe('94px')
  })

  it('landscape: width clamped to viewport when grid displayWidth would exceed innerWidth', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 300, configurable: true })

    // 40x10 grid: aspectRatio = 40/10 = 4.0, landscape (vw=500 >= vh=300)
    // displayHeight=300, displayWidth=Math.round(300*4)=1200 > 500
    // clamped: displayWidth=500, displayHeight=Math.round(500/4)=125
    const { canvas } = makeRenderer(40, 10)
    expect(canvas.style.width).toBe('500px')
    expect(canvas.style.height).toBe('125px')
  })

  it('portrait: canvas pixel buffer dimensions scaled by dpr with non-square grid', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true })

    // 10x20 grid: aspectRatio=0.5, portrait → displayWidth=375, displayHeight=750
    const { canvas } = makeRenderer(10, 20)
    expect(canvas.width).toBe(Math.round(375 * 2))
    expect(canvas.height).toBe(Math.round(750 * 2))
  })

  it('landscape: canvas pixel buffer dimensions scaled by dpr with non-square grid', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 844, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 390, configurable: true })

    // 40x20 grid: aspectRatio=2, landscape → displayWidth=780, displayHeight=390
    const { canvas } = makeRenderer(40, 20)
    expect(canvas.width).toBe(Math.round(780 * 2))
    expect(canvas.height).toBe(Math.round(390 * 2))
  })

  it('recomputes on window resize event', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true })
    const { ctx } = makeRenderer()

    const callsBefore = (ctx.setTransform as ReturnType<typeof vi.fn>).mock.calls.length
    Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true })
    window.dispatchEvent(new Event('resize'))
    expect((ctx.setTransform as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsBefore)
  })
})

describe('touch hint alpha decay', () => {
  it('alpha is 1 at start (timestamp == touchHintStart)', () => {
    const touchHintStart = 1000
    const timestamp = 1000
    const alpha = Math.max(0, 1 - (timestamp - touchHintStart) / 3000)
    expect(alpha).toBe(1)
  })

  it('alpha is 0.5 at 1500ms', () => {
    const touchHintStart = 0
    const timestamp = 1500
    const alpha = Math.max(0, 1 - (timestamp - touchHintStart) / 3000)
    expect(alpha).toBeCloseTo(0.5)
  })

  it('alpha is 0 at 3000ms', () => {
    const touchHintStart = 0
    const timestamp = 3000
    const alpha = Math.max(0, 1 - (timestamp - touchHintStart) / 3000)
    expect(alpha).toBe(0)
  })

  it('alpha clamps to 0 after 3000ms', () => {
    const touchHintStart = 0
    const timestamp = 5000
    const alpha = Math.max(0, 1 - (timestamp - touchHintStart) / 3000)
    expect(alpha).toBe(0)
  })

  it('renderTouchHint is called in PLAYING state when touchHintAlpha > 0', () => {
    const { renderer, ctx } = makeRenderer()
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    game.start()
    renderer.render(game, [], 0.8)
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
    expect(texts).toContain('Swipe to move')
  })

  it('renderTouchHint is NOT called when touchHintAlpha is 0', () => {
    const { renderer, ctx } = makeRenderer()
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    game.start()
    renderer.render(game, [], 0)
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
    expect(texts).not.toContain('Swipe to move')
  })
})

describe('Renderer.clear()', () => {
  it('calls clearRect on context', () => {
    const { renderer, ctx } = makeRenderer()
    renderer.clear()
    expect(ctx.clearRect).toHaveBeenCalled()
  })
})

describe('Renderer.render()', () => {
  let game: Game

  beforeEach(() => {
    game = new Game({ gridWidth: 20, gridHeight: 20 })
  })

  it('renders without throwing in MENU state', () => {
    const { renderer } = makeRenderer()
    expect(() => renderer.render(game)).not.toThrow()
  })

  it('renders without throwing in PLAYING state', () => {
    const { renderer } = makeRenderer()
    game.start()
    expect(() => renderer.render(game)).not.toThrow()
  })

  it('renders without throwing in PAUSED state', () => {
    const { renderer } = makeRenderer()
    game.start()
    game.pause()
    expect(() => renderer.render(game)).not.toThrow()
  })

  it('renders without throwing in GAME_OVER state', () => {
    const { renderer } = makeRenderer()
    game.start()
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = game.snake.nextDirection = 'RIGHT' as never
    game.update()
    expect(() => renderer.render(game)).not.toThrow()
  })

  it('calls clearRect each render frame', () => {
    const { renderer, ctx } = makeRenderer()
    renderer.render(game)
    expect(ctx.clearRect).toHaveBeenCalled()
  })

  it('calls fillRect for background each render frame', () => {
    const { renderer, ctx } = makeRenderer()
    renderer.render(game)
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('draws snake segments when PLAYING', () => {
    const { renderer, ctx } = makeRenderer()
    game.start()
    renderer.render(game)
    expect(ctx.roundRect).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('draws food arc when PLAYING', () => {
    const { renderer, ctx } = makeRenderer()
    game.start()
    renderer.render(game)
    expect(ctx.arc).toHaveBeenCalled()
  })

  it('does not draw food arc in MENU state', () => {
    const { renderer, ctx } = makeRenderer()
    renderer.render(game)
    expect(ctx.arc).not.toHaveBeenCalled()
  })

  it('renders PIXELSNEK title text in MENU state', () => {
    const { renderer, ctx } = makeRenderer()
    renderer.render(game)
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
    expect(texts).toContain('PIXELSNEK')
  })

  it('renders Score HUD text in PLAYING state', () => {
    const { renderer, ctx } = makeRenderer()
    game.start()
    renderer.render(game)
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
    expect(texts.some((t) => t.startsWith('Score:'))).toBe(true)
  })

  it('renders HUD and PAUSED text in PAUSED state', () => {
    const { renderer, ctx } = makeRenderer()
    game.start()
    game.pause()
    renderer.render(game)
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
    expect(texts.some((t) => t.startsWith('Score:'))).toBe(true)
    expect(texts).toContain('PAUSED')
  })

  it('renders GAME OVER text in GAME_OVER state', () => {
    const { renderer, ctx } = makeRenderer()
    game.start()
    game.snake.segments = [{ x: 19, y: 10 }]
    game.snake.direction = game.snake.nextDirection = 'RIGHT' as never
    game.update()
    renderer.render(game)
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map((c: unknown[]) => c[0] as string)
    expect(texts).toContain('GAME OVER')
  })
})

describe('Renderer.setShowGrid()', () => {
  it('draws grid lines by default', () => {
    const { renderer, ctx } = makeRenderer()
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    ;(ctx.lineTo as ReturnType<typeof vi.fn>).mockClear()
    renderer.render(game)
    expect((ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0)
  })

  it('does not draw grid lines when showGrid is false', () => {
    const { renderer, ctx } = makeRenderer()
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    renderer.setShowGrid(false)
    ;(ctx.lineTo as ReturnType<typeof vi.fn>).mockClear()
    renderer.render(game)
    expect((ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0)
  })

  it('resumes drawing grid lines after setShowGrid(true)', () => {
    const { renderer, ctx } = makeRenderer()
    const game = new Game({ gridWidth: 20, gridHeight: 20 })
    renderer.setShowGrid(false)
    renderer.setShowGrid(true)
    ;(ctx.lineTo as ReturnType<typeof vi.fn>).mockClear()
    renderer.render(game)
    expect((ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0)
  })
})

describe('Renderer.renderParticles()', () => {
  it('renders particles without throwing', () => {
    const { renderer } = makeRenderer()
    const particles = [
      { x: 100, y: 100, vx: 1, vy: -1, radius: 3, color: '#ff0000', alpha: 0.8, lifetime: 30, maxLifetime: 60, gravity: 0.1 },
      { x: 200, y: 150, vx: -1, vy: 1, radius: 3, color: '#00ff00', alpha: 0.5, lifetime: 10, maxLifetime: 60, gravity: 0.1 },
    ]
    expect(() => renderer.renderParticles(particles)).not.toThrow()
  })

  it('draws one arc per particle', () => {
    const { renderer, ctx } = makeRenderer()
    const particles = [
      { x: 10, y: 10, vx: 0, vy: 0, radius: 3, color: '#fff', alpha: 1, lifetime: 30, maxLifetime: 60, gravity: 0 },
      { x: 20, y: 20, vx: 0, vy: 0, radius: 3, color: '#fff', alpha: 1, lifetime: 30, maxLifetime: 60, gravity: 0 },
    ]
    renderer.renderParticles(particles)
    expect((ctx.arc as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2)
  })

  it('resets globalAlpha to 1 after rendering particles', () => {
    const { renderer, ctx } = makeRenderer()
    const particles = [
      { x: 10, y: 10, vx: 0, vy: 0, radius: 3, color: '#fff', alpha: 0.5, lifetime: 20, maxLifetime: 60, gravity: 0 },
    ]
    renderer.renderParticles(particles)
    expect(ctx.globalAlpha).toBe(1)
  })

  it('handles empty particle array without throwing', () => {
    const { renderer } = makeRenderer()
    expect(() => renderer.renderParticles([])).not.toThrow()
  })
})
