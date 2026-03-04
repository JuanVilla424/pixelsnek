import { Particle } from '../game/types'

export interface EmitConfig {
  color: string
  speedMin: number
  speedMax: number
  lifeMin: number
  lifeMax: number
  radiusMin: number
  radiusMax: number
  gravity?: number
}

export class ParticleSystem {
  private particles: Particle[] = []

  emit(x: number, y: number, count: number, config: EmitConfig): void {
    const gravity = config.gravity ?? 0
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin)
      const life = config.lifeMin + Math.random() * (config.lifeMax - config.lifeMin)
      const radius = config.radiusMin + Math.random() * (config.radiusMax - config.radiusMin)
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        color: config.color,
        alpha: 1,
        lifetime: life,
        maxLifetime: life,
        gravity,
      })
    }
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += p.gravity * dt
      p.lifetime -= dt
      p.alpha = Math.max(0, p.lifetime / p.maxLifetime)
    }
    this.particles = this.particles.filter((p) => p.lifetime > 0)
  }

  getParticles(): Particle[] {
    return this.particles
  }
}
