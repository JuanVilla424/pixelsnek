import { Direction, isOppositeDirection } from '../game/types'

const MAX_QUEUE_SIZE = 2
const SWIPE_THRESHOLD = 30

type DirectionCallback = (dir: Direction) => void
type VoidCallback = () => void

export class InputManager {
  private readonly canvas: HTMLCanvasElement
  private readonly queue: Direction[] = []
  private currentDirection: Direction | null = null
  private onDirectionChangeCb: DirectionCallback | null = null
  private onPauseCb: VoidCallback | null = null
  private onEscapeCb: VoidCallback | null = null
  private onLeaderboardCb: VoidCallback | null = null
  private onClearLeaderboardCb: VoidCallback | null = null
  private touchStart: { x: number; y: number } | null = null

  private readonly boundKeyDown: (e: KeyboardEvent) => void
  private readonly boundTouchStart: (e: TouchEvent) => void
  private readonly boundTouchEnd: (e: TouchEvent) => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.boundKeyDown = this.handleKeyDown.bind(this)
    this.boundTouchStart = this.handleTouchStart.bind(this)
    this.boundTouchEnd = this.handleTouchEnd.bind(this)

    window.addEventListener('keydown', this.boundKeyDown)
    canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false })
    canvas.addEventListener('touchend', this.boundTouchEnd, { passive: false })
  }

  setOnDirectionChange(cb: DirectionCallback): void {
    this.onDirectionChangeCb = cb
  }

  setOnPause(cb: VoidCallback): void {
    this.onPauseCb = cb
  }

  setOnEscape(cb: VoidCallback): void {
    this.onEscapeCb = cb
  }

  setOnLeaderboard(cb: VoidCallback): void {
    this.onLeaderboardCb = cb
  }

  setOnClearLeaderboard(cb: VoidCallback): void {
    this.onClearLeaderboardCb = cb
  }

  setCurrentDirection(dir: Direction): void {
    this.currentDirection = dir
  }

  dequeueDirection(): Direction | undefined {
    const dir = this.queue.shift()
    if (dir !== undefined) {
      this.currentDirection = dir
    }
    return dir
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown)
    this.canvas.removeEventListener('touchstart', this.boundTouchStart)
    this.canvas.removeEventListener('touchend', this.boundTouchEnd)
  }

  private enqueueDirection(dir: Direction): void {
    if (this.queue.length >= MAX_QUEUE_SIZE) return

    const reference =
      this.queue.length > 0 ? this.queue[this.queue.length - 1] : this.currentDirection

    if (reference !== undefined && reference !== null && isOppositeDirection(reference, dir)) return

    this.queue.push(dir)
    this.onDirectionChangeCb?.(dir)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase()

    switch (key) {
      case 'arrowup':
      case 'w':
        event.preventDefault()
        this.enqueueDirection(Direction.Up)
        break
      case 'arrowdown':
      case 's':
        event.preventDefault()
        this.enqueueDirection(Direction.Down)
        break
      case 'arrowleft':
      case 'a':
        event.preventDefault()
        this.enqueueDirection(Direction.Left)
        break
      case 'arrowright':
      case 'd':
        event.preventDefault()
        this.enqueueDirection(Direction.Right)
        break
      case ' ':
      case 'enter':
        event.preventDefault()
        this.onPauseCb?.()
        break
      case 'escape':
        this.onEscapeCb?.()
        break
      case 'l':
        this.onLeaderboardCb?.()
        break
      case 'c':
        this.onClearLeaderboardCb?.()
        break
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()
    const touch = event.touches[0]
    if (!touch) return
    this.touchStart = { x: touch.clientX, y: touch.clientY }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()
    if (!this.touchStart) return

    const touch = event.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - this.touchStart.x
    const deltaY = touch.clientY - this.touchStart.y
    this.touchStart = null

    if (Math.abs(deltaX) <= SWIPE_THRESHOLD && Math.abs(deltaY) <= SWIPE_THRESHOLD) return

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.enqueueDirection(deltaX > 0 ? Direction.Right : Direction.Left)
    } else {
      this.enqueueDirection(deltaY > 0 ? Direction.Down : Direction.Up)
    }
  }
}
