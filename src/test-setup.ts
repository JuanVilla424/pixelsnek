// Polyfill Touch for jsdom which does not implement the Touch constructor
if (typeof globalThis.Touch === 'undefined') {
  class TouchPolyfill {
    readonly identifier: number
    readonly target: EventTarget
    readonly clientX: number
    readonly clientY: number
    readonly screenX: number = 0
    readonly screenY: number = 0
    readonly pageX: number = 0
    readonly pageY: number = 0
    readonly radiusX: number = 0
    readonly radiusY: number = 0
    readonly rotationAngle: number = 0
    readonly force: number = 0

    constructor(init: TouchInit) {
      this.identifier = init.identifier
      this.target = init.target
      this.clientX = init.clientX ?? 0
      this.clientY = init.clientY ?? 0
    }
  }

  globalThis.Touch = TouchPolyfill as unknown as typeof Touch
}
