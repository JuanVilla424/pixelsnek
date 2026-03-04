import './styles/main.css'
import { InputManager } from './engine/Input'
import { Renderer } from './engine/Renderer'
import { Game } from './game/Game'
import { Direction, GameState } from './game/types'
import { ThemeManager } from './ui/Theme'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null

if (!canvas) {
  throw new Error('Canvas element #game-canvas not found')
}

const themeManager = new ThemeManager()

const toggleBtn = document.createElement('button')
toggleBtn.id = 'theme-toggle'
toggleBtn.setAttribute('aria-label', 'Toggle theme')
toggleBtn.textContent = '🌙'
document.body.appendChild(toggleBtn)

function updateToggleIcon(): void {
  const setting = themeManager.getSetting()
  if (setting === 'dark') {
    toggleBtn.textContent = '🌙'
  } else if (setting === 'light') {
    toggleBtn.textContent = '☀️'
  } else {
    toggleBtn.textContent = '🖥️'
  }
}

updateToggleIcon()

toggleBtn.addEventListener('click', () => {
  themeManager.toggle()
  updateToggleIcon()
})

const GRID_WIDTH = 20
const GRID_HEIGHT = 20

const game = new Game({ gridWidth: GRID_WIDTH, gridHeight: GRID_HEIGHT })
const renderer = new Renderer(canvas, GRID_WIDTH, GRID_HEIGHT, themeManager)
const input = new InputManager(canvas)

input.setOnDirectionChange((dir: Direction) => {
  game.snake.setDirection(dir)
})

input.setOnPause(() => {
  if (game.state === GameState.PLAYING) {
    game.pause()
  } else if (game.state === GameState.PAUSED) {
    game.resume()
  }
})

input.setOnEscape(() => {
  if (game.state === GameState.GAME_OVER || game.state === GameState.PAUSED) {
    game.reset()
  }
})

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (game.state === GameState.MENU || game.state === GameState.GAME_OVER) {
      game.start()
    }
  }
})

let lastTick = 0

function loop(timestamp: number): void {
  const interval = game.getTickInterval()
  if (timestamp - lastTick >= interval) {
    game.update()
    lastTick = timestamp
  }
  renderer.render(game)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
