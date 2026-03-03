import './styles/main.css'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null

if (!canvas) {
  throw new Error('Canvas element #game-canvas not found')
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight
