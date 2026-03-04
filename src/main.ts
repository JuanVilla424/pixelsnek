import './styles/main.css'
import { InputManager } from './engine/Input'
import { Renderer } from './engine/Renderer'
import { ParticleSystem } from './engine/Particles'
import { Game } from './game/Game'
import { Direction, GameState, GameCallbacks } from './game/types'
import { ThemeManager, createThemeToggle } from './ui/Theme'
import { Leaderboard } from './ui/Leaderboard'
import { SettingsManager, SettingsPanel } from './ui/Settings'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null

if (!canvas) {
  throw new Error('Canvas element #game-canvas not found')
}

const themeManager = new ThemeManager()
createThemeToggle(themeManager)

const settingsManager = new SettingsManager()
const initialSettings = settingsManager.get()

const renderer = new Renderer(canvas, initialSettings.gridWidth, initialSettings.gridHeight, themeManager)
const particleSystem = new ParticleSystem()
const leaderboard = new Leaderboard()
const settingsPanel = new SettingsPanel()

renderer.setShowGrid(initialSettings.showGrid)
particleSystem.setEnabled(initialSettings.showParticles)

let leaderboardVisible = false
let leaderboardHighlightIndex: number | undefined = undefined
let clearConfirmPending = false
let clearConfirmTimer: ReturnType<typeof setTimeout> | null = null

function showLeaderboard(highlightIdx?: number): void {
  leaderboardVisible = true
  leaderboardHighlightIndex = highlightIdx
  clearConfirmPending = false
}

function hideLeaderboard(): void {
  leaderboardVisible = false
  leaderboardHighlightIndex = undefined
  clearConfirmPending = false
  if (clearConfirmTimer !== null) {
    clearTimeout(clearConfirmTimer)
    clearConfirmTimer = null
  }
}

const storedHighScore = parseInt(localStorage.getItem('pixelsnek-highscore') ?? '0', 10)

// game is declared before callbacks so closures capture the binding
let game!: Game

function makeCallbacks(): GameCallbacks {
  return {
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
    onStateChange: (state) => {
      if (state === GameState.GAME_OVER) {
        const savedBest = parseInt(localStorage.getItem('pixelsnek-highscore') ?? '0', 10)
        if (game.highScore > savedBest) {
          localStorage.setItem('pixelsnek-highscore', String(game.highScore))
        }
        if (leaderboard.isHighScore(game.score)) {
          leaderboard.showNameInput(canvas!, themeManager.getColors(), (name) => {
            const entry = {
              name,
              score: game.score,
              level: game.level,
              date: new Date().toISOString(),
            }
            leaderboard.addEntry(entry)
            const entries = leaderboard.getEntries()
            const idx = entries.findIndex(
              (e) => e.name === entry.name && e.score === entry.score && e.date === entry.date,
            )
            showLeaderboard(idx >= 0 ? idx : undefined)
          })
        }
      } else if (state === GameState.MENU) {
        hideLeaderboard()
        leaderboard.hideNameInput()
      }
    },
  }
}

game = new Game(
  { gridWidth: initialSettings.gridWidth, gridHeight: initialSettings.gridHeight, initialSpeed: initialSettings.initialSpeed },
  makeCallbacks(),
)
game.highScore = isNaN(storedHighScore) ? 0 : storedHighScore

const input = new InputManager(canvas)
input.setControlScheme(initialSettings.controlScheme)

input.setOnDirectionChange((dir: Direction) => {
  game.snake.setDirection(dir)
})

input.setOnPause(() => {
  if (settingsPanel.isOpen()) return
  if (game.state === GameState.MENU || game.state === GameState.GAME_OVER) {
    if (!leaderboardVisible) {
      game.start()
    }
  } else if (game.state === GameState.PLAYING) {
    game.pause()
  } else if (game.state === GameState.PAUSED) {
    game.resume()
  }
})

input.setOnEscape(() => {
  if (settingsPanel.isOpen()) {
    settingsPanel.close()
    return
  }
  if (leaderboardVisible) {
    hideLeaderboard()
    return
  }
  if (game.state === GameState.GAME_OVER || game.state === GameState.PAUSED) {
    game.reset()
  }
})

input.setOnLeaderboard(() => {
  if (game.state === GameState.GAME_OVER) {
    if (leaderboardVisible) {
      hideLeaderboard()
    } else {
      showLeaderboard()
    }
  }
})

input.setOnClearLeaderboard(() => {
  if (!leaderboardVisible) return
  if (clearConfirmPending) {
    leaderboard.clear()
    clearConfirmPending = false
    if (clearConfirmTimer !== null) {
      clearTimeout(clearConfirmTimer)
      clearConfirmTimer = null
    }
  } else {
    clearConfirmPending = true
    if (clearConfirmTimer !== null) clearTimeout(clearConfirmTimer)
    clearConfirmTimer = setTimeout(() => {
      clearConfirmPending = false
      clearConfirmTimer = null
    }, 3000)
  }
})

// Gear icon settings button
const gearBtn = document.createElement('button')
gearBtn.id = 'settings-btn'
gearBtn.setAttribute('aria-label', 'Settings')
gearBtn.textContent = '⚙️'
gearBtn.addEventListener('click', () => {
  if (settingsPanel.isOpen()) return
  if (game.state !== GameState.MENU && game.state !== GameState.PAUSED) return
  settingsPanel.open(settingsManager.get(), {
    onApply: (newSettings) => {
      settingsManager.update(newSettings)
      renderer.setGridSize(newSettings.gridWidth, newSettings.gridHeight)
      renderer.setShowGrid(newSettings.showGrid)
      particleSystem.setEnabled(newSettings.showParticles)
      input.setControlScheme(newSettings.controlScheme)
      const prevHighScore = game.highScore
      game = new Game(
        { gridWidth: newSettings.gridWidth, gridHeight: newSettings.gridHeight, initialSpeed: newSettings.initialSpeed },
        makeCallbacks(),
      )
      game.highScore = isNaN(prevHighScore) ? 0 : prevHighScore
    },
    onClose: () => {},
  })
})
document.body.appendChild(gearBtn)

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
  renderer.render(game, particleSystem.getParticles())
  if (leaderboardVisible) {
    renderer.renderLeaderboard(leaderboard, leaderboardHighlightIndex, clearConfirmPending)
  }
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
