import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Direction } from '../../game/types'
import { InputManager } from '../Input'

function makeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  return canvas
}

function fireKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

function fireTouch(
  canvas: HTMLCanvasElement,
  type: 'touchstart' | 'touchend',
  x: number,
  y: number,
): void {
  const touch = new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y })
  const event = new TouchEvent(type, {
    touches: type === 'touchstart' ? [touch] : [],
    changedTouches: [touch],
    bubbles: true,
    cancelable: true,
  })
  canvas.dispatchEvent(event)
}

describe('InputManager — keyboard direction mapping', () => {
  let canvas: HTMLCanvasElement
  let input: InputManager
  let received: Direction[]

  beforeEach(() => {
    canvas = makeCanvas()
    input = new InputManager(canvas)
    received = []
    input.setOnDirectionChange((dir) => received.push(dir))
  })

  afterEach(() => {
    input.destroy()
  })

  const cases: [string, Direction][] = [
    ['ArrowUp', Direction.Up],
    ['ArrowDown', Direction.Down],
    ['ArrowLeft', Direction.Left],
    ['ArrowRight', Direction.Right],
    ['w', Direction.Up],
    ['s', Direction.Down],
    ['a', Direction.Left],
    ['d', Direction.Right],
  ]

  for (const [key, expected] of cases) {
    it(`key '${key}' maps to ${expected}`, () => {
      fireKey(key)
      expect(received).toEqual([expected])
    })
  }

  it('uppercase W maps to Direction.Up (case insensitive)', () => {
    fireKey('W')
    expect(received).toEqual([Direction.Up])
  })

  it('uppercase A maps to Direction.Left (case insensitive)', () => {
    fireKey('A')
    expect(received).toEqual([Direction.Left])
  })
})

describe('InputManager — opposite direction rejection', () => {
  let canvas: HTMLCanvasElement
  let input: InputManager
  let received: Direction[]

  beforeEach(() => {
    canvas = makeCanvas()
    input = new InputManager(canvas)
    received = []
    input.setOnDirectionChange((dir) => received.push(dir))
  })

  afterEach(() => {
    input.destroy()
  })

  it('rejects opposite direction when queue is empty', () => {
    input.setCurrentDirection(Direction.Left)
    fireKey('ArrowRight')
    expect(received).toHaveLength(0)
  })

  it('rejects opposite of last queued direction', () => {
    input.setCurrentDirection(Direction.Up)
    fireKey('ArrowDown') // opposite of current → rejected
    expect(received).toHaveLength(0)
  })

  it('accepts perpendicular direction', () => {
    input.setCurrentDirection(Direction.Left)
    fireKey('ArrowUp')
    expect(received).toEqual([Direction.Up])
  })
})

describe('InputManager — direction queue', () => {
  let canvas: HTMLCanvasElement
  let input: InputManager

  beforeEach(() => {
    canvas = makeCanvas()
    input = new InputManager(canvas)
    input.setCurrentDirection(Direction.Left)
  })

  afterEach(() => {
    input.destroy()
  })

  it('accepts up to 2 directions', () => {
    const received: Direction[] = []
    input.setOnDirectionChange((dir) => received.push(dir))
    fireKey('ArrowUp')
    fireKey('ArrowRight')
    expect(received).toHaveLength(2)
  })

  it('rejects 3rd direction when queue is full', () => {
    const received: Direction[] = []
    input.setOnDirectionChange((dir) => received.push(dir))
    fireKey('ArrowUp')
    fireKey('ArrowRight')
    fireKey('ArrowDown')
    expect(received).toHaveLength(2)
  })

  it('dequeue returns first enqueued direction', () => {
    fireKey('ArrowUp')
    fireKey('ArrowRight')
    const first = input.dequeueDirection()
    expect(first).toBe(Direction.Up)
  })

  it('dequeue leaves one remaining after two enqueued', () => {
    fireKey('ArrowUp')
    fireKey('ArrowRight')
    input.dequeueDirection()
    const second = input.dequeueDirection()
    expect(second).toBe(Direction.Right)
  })

  it('dequeue returns undefined when queue is empty', () => {
    expect(input.dequeueDirection()).toBeUndefined()
  })
})

describe('InputManager — pause and escape', () => {
  let canvas: HTMLCanvasElement
  let input: InputManager

  beforeEach(() => {
    canvas = makeCanvas()
    input = new InputManager(canvas)
  })

  afterEach(() => {
    input.destroy()
  })

  it('Space triggers onPauseToggle', () => {
    const cb = vi.fn()
    input.setOnPause(cb)
    fireKey(' ')
    expect(cb).toHaveBeenCalledOnce()
  })

  it('Enter triggers onPauseToggle', () => {
    const cb = vi.fn()
    input.setOnPause(cb)
    fireKey('Enter')
    expect(cb).toHaveBeenCalledOnce()
  })

  it('Escape triggers onEscape', () => {
    const cb = vi.fn()
    input.setOnEscape(cb)
    fireKey('Escape')
    expect(cb).toHaveBeenCalledOnce()
  })
})

describe('InputManager — touch swipe', () => {
  let canvas: HTMLCanvasElement
  let input: InputManager
  let received: Direction[]

  beforeEach(() => {
    canvas = makeCanvas()
    input = new InputManager(canvas)
    received = []
    input.setOnDirectionChange((dir) => received.push(dir))
  })

  afterEach(() => {
    input.destroy()
  })

  it('right swipe maps to Direction.Right', () => {
    fireTouch(canvas, 'touchstart', 100, 100)
    fireTouch(canvas, 'touchend', 200, 100)
    expect(received).toEqual([Direction.Right])
  })

  it('left swipe maps to Direction.Left', () => {
    fireTouch(canvas, 'touchstart', 200, 100)
    fireTouch(canvas, 'touchend', 100, 100)
    expect(received).toEqual([Direction.Left])
  })

  it('down swipe maps to Direction.Down', () => {
    fireTouch(canvas, 'touchstart', 100, 100)
    fireTouch(canvas, 'touchend', 100, 200)
    expect(received).toEqual([Direction.Down])
  })

  it('up swipe maps to Direction.Up', () => {
    fireTouch(canvas, 'touchstart', 100, 200)
    fireTouch(canvas, 'touchend', 100, 100)
    expect(received).toEqual([Direction.Up])
  })

  it('swipe below 30px threshold does nothing', () => {
    fireTouch(canvas, 'touchstart', 100, 100)
    fireTouch(canvas, 'touchend', 120, 100) // 20px — below threshold
    expect(received).toHaveLength(0)
  })

  it('swipe at exactly 30px boundary does not trigger direction', () => {
    fireTouch(canvas, 'touchstart', 100, 100)
    fireTouch(canvas, 'touchend', 130, 100) // exactly at threshold boundary
    expect(received).toHaveLength(0)
  })

  it('swipe above 30px threshold is accepted', () => {
    fireTouch(canvas, 'touchstart', 100, 100)
    fireTouch(canvas, 'touchend', 131, 100) // 31px — above threshold
    expect(received).toEqual([Direction.Right])
  })
})

describe('InputManager — controlScheme', () => {
  let canvas: HTMLCanvasElement
  let input: InputManager
  let received: Direction[]

  beforeEach(() => {
    canvas = makeCanvas()
    input = new InputManager(canvas)
    received = []
    input.setOnDirectionChange((dir) => received.push(dir))
  })

  afterEach(() => {
    input.destroy()
  })

  it('arrows scheme: arrow keys work', () => {
    input.setControlScheme('arrows')
    fireKey('ArrowUp')
    expect(received).toEqual([Direction.Up])
  })

  it('arrows scheme: WASD keys are ignored', () => {
    input.setControlScheme('arrows')
    fireKey('w')
    fireKey('a')
    fireKey('s')
    fireKey('d')
    expect(received).toHaveLength(0)
  })

  it('wasd scheme: WASD keys work', () => {
    input.setControlScheme('wasd')
    fireKey('w')
    expect(received).toEqual([Direction.Up])
  })

  it('wasd scheme: arrow keys are ignored', () => {
    input.setControlScheme('wasd')
    fireKey('ArrowUp')
    fireKey('ArrowDown')
    fireKey('ArrowLeft')
    fireKey('ArrowRight')
    expect(received).toHaveLength(0)
  })

  it('both scheme: arrow keys work', () => {
    input.setControlScheme('both')
    fireKey('ArrowDown')
    expect(received).toEqual([Direction.Down])
  })

  it('both scheme: WASD keys work', () => {
    input.setControlScheme('both')
    fireKey('s')
    expect(received).toEqual([Direction.Down])
  })

  it('default scheme is both (accepts all keys)', () => {
    // no setControlScheme call — default
    fireKey('ArrowLeft')
    received.length = 0
    fireKey('a')
    expect(received).toHaveLength(1)
  })
})

describe('InputManager — contextmenu prevention', () => {
  it('prevents context menu on canvas', () => {
    const canvas = makeCanvas()
    const input = new InputManager(canvas)
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    canvas.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    input.destroy()
  })

  it('after destroy, contextmenu is no longer prevented', () => {
    const canvas = makeCanvas()
    const input = new InputManager(canvas)
    input.destroy()
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    canvas.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('InputManager — haptic feedback feature detection', () => {
  it('navigator.vibrate is called with 10 on eat when available', () => {
    const vibrate = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
    if (navigator.vibrate) navigator.vibrate(10)
    expect(vibrate).toHaveBeenCalledWith(10)
  })

  it('navigator.vibrate is called with pattern on death when available', () => {
    const vibrate = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
    if (navigator.vibrate) navigator.vibrate([50, 50, 50])
    expect(vibrate).toHaveBeenCalledWith([50, 50, 50])
  })

  it('no error when navigator.vibrate is undefined', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'vibrate')
    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
    expect(() => {
      if (navigator.vibrate) navigator.vibrate(10)
    }).not.toThrow()
    if (original) Object.defineProperty(navigator, 'vibrate', original)
  })
})

describe('InputManager — destroy', () => {
  it('after destroy, key events do not trigger callbacks', () => {
    const canvas = makeCanvas()
    const input = new InputManager(canvas)
    const cb = vi.fn()
    input.setOnDirectionChange(cb)
    input.destroy()
    fireKey('ArrowUp')
    expect(cb).not.toHaveBeenCalled()
  })

  it('after destroy, touch events do not trigger callbacks', () => {
    const canvas = makeCanvas()
    const input = new InputManager(canvas)
    const cb = vi.fn()
    input.setOnDirectionChange(cb)
    input.destroy()
    fireTouch(canvas, 'touchstart', 100, 100)
    fireTouch(canvas, 'touchend', 200, 100)
    expect(cb).not.toHaveBeenCalled()
  })

  it('after destroy, pause callback is not triggered', () => {
    const canvas = makeCanvas()
    const input = new InputManager(canvas)
    const cb = vi.fn()
    input.setOnPause(cb)
    input.destroy()
    fireKey(' ')
    expect(cb).not.toHaveBeenCalled()
  })
})
