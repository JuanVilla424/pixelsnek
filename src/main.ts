import './styles/main.css'
import { InputManager } from './engine/Input'
import { Renderer } from './engine/Renderer'
import { ParticleSystem } from './engine/Particles'
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

const renderer = new Renderer(canvas, GRID_WIDTH, GRID_HEIGHT, themeManager)
const particleSystem = new ParticleSystem()

const game = new Game(
  { gridWidth: GRID_WIDTH, gridHeight: GRID_HEIGHT },
  {
    onEat: (headPos) => {
      const cs = renderer.getCellSize()
      const colors = themeManager.getColors()
      particleSystem.emit(headPos.x * cs + cs / 2, headPos.y * cs + cs / 2, 12, {
        color: colors.food,
        speedMin: 2,
        speedMax: 5,
        lifeMin: 0.4,
        lifeMax: 0.8,
        radiusMin: 2,
        radiusMax: 4,
      })
    },
    onDeath: (segments) => {
      const cs = renderer.getCellSize()
      const colors = themeManager.getColors()
      for (const seg of segments) {
        particleSystem.emit(seg.x * cs + cs / 2, seg.y * cs + cs / 2, 3 + Math.floor(Math.random() * 3), {
          color: colors.snakeBody,
          speedMin: 1,
          speedMax: 3,
          lifeMin: 0.6,
          lifeMax: 1.2,
          radiusMin: 2,
          radiusMax: 6,
          gravity: 50,
        })
      }
    },
  },
)

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
let lastTime = 0

function loop(timestamp: number): void {
  const dt = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000
  lastTime = timestamp

  const interval = game.getTickInterval()
  if (timestamp - lastTick >= interval) {
    game.update()
    lastTick = timestamp
  }

  particleSystem.update(dt)
  game.particles = particleSystem.getParticles()
  renderer.render(game)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
