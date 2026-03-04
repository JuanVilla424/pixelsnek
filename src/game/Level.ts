const INITIAL_SPEED = 150
const SPEED_DECREMENT = 10
const MIN_SPEED = 50
const FOOD_PER_LEVEL = 5

export function getSpeedForLevel(level: number, initialSpeed: number = INITIAL_SPEED): number {
  const speed = initialSpeed - (level - 1) * SPEED_DECREMENT
  return Math.max(speed, MIN_SPEED)
}

export function getLevelForScore(score: number): number {
  return Math.floor(score / FOOD_PER_LEVEL) + 1
}
