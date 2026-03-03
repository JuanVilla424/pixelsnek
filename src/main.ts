import './styles/main.css'
import { InputManager } from './engine/Input'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null

if (!canvas) {
  throw new Error('Canvas element #game-canvas not found')
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const input = new InputManager(canvas)

input.setOnDirectionChange((_dir) => {
  // wired to game.snake.setDirection in subsequent implementation steps
})

input.setOnPause(() => {
  // wired to game.togglePause in subsequent implementation steps
})

input.setOnEscape(() => {
  // wired to menu navigation in subsequent implementation steps
})

export { input }
