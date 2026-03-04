import { describe, it, expect } from 'vitest'
import { ParticleSystem, EAT_CONFIG, DEATH_CONFIG } from '../Particles'

const BASE_CONFIG = {
  color: '#ff0000',
  speedMin: 2,
  speedMax: 5,
  lifeMin: 0.4,
  lifeMax: 0.8,
  radiusMin: 2,
  radiusMax: 4,
}

describe('ParticleSystem.getParticles()', () => {
  it('returns empty array initially', () => {
    const ps = new ParticleSystem()
    expect(ps.getParticles()).toHaveLength(0)
  })

  it('returns the active particles array', () => {
    const ps = new ParticleSystem()
    ps.emit(100, 200, 5, BASE_CONFIG)
    expect(ps.getParticles()).toHaveLength(5)
  })
})

describe('ParticleSystem.emit()', () => {
  it('creates the specified number of particles', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 12, BASE_CONFIG)
    expect(ps.getParticles()).toHaveLength(12)
  })

  it('places particles at the given origin', () => {
    const ps = new ParticleSystem()
    ps.emit(50, 75, 3, BASE_CONFIG)
    for (const p of ps.getParticles()) {
      expect(p.x).toBe(50)
      expect(p.y).toBe(75)
    }
  })

  it('initializes alpha to 1', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 4, BASE_CONFIG)
    for (const p of ps.getParticles()) {
      expect(p.alpha).toBe(1)
    }
  })

  it('sets particle color from config', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 2, { ...BASE_CONFIG, color: '#00ff00' })
    for (const p of ps.getParticles()) {
      expect(p.color).toBe('#00ff00')
    }
  })

  it('radius is within configured range', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 20, { ...BASE_CONFIG, radiusMin: 2, radiusMax: 4 })
    for (const p of ps.getParticles()) {
      expect(p.radius).toBeGreaterThanOrEqual(2)
      expect(p.radius).toBeLessThanOrEqual(4)
    }
  })

  it('lifetime is within configured range', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 20, { ...BASE_CONFIG, lifeMin: 0.4, lifeMax: 0.8 })
    for (const p of ps.getParticles()) {
      expect(p.lifetime).toBeGreaterThanOrEqual(0.4)
      expect(p.lifetime).toBeLessThanOrEqual(0.8)
    }
  })

  it('velocity magnitude is within speed range', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 20, { ...BASE_CONFIG, speedMin: 2, speedMax: 5 })
    for (const p of ps.getParticles()) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      expect(speed).toBeGreaterThanOrEqual(2 - 0.001)
      expect(speed).toBeLessThanOrEqual(5 + 0.001)
    }
  })

  it('defaults gravity to 0 when not provided', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 3, BASE_CONFIG)
    for (const p of ps.getParticles()) {
      expect(p.gravity).toBe(0)
    }
  })

  it('sets gravity from config', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 3, { ...BASE_CONFIG, gravity: 50 })
    for (const p of ps.getParticles()) {
      expect(p.gravity).toBe(50)
    }
  })

  it('accumulates particles across multiple emit calls', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 5, BASE_CONFIG)
    ps.emit(10, 10, 7, BASE_CONFIG)
    expect(ps.getParticles()).toHaveLength(12)
  })
})

describe('ParticleSystem.update()', () => {
  it('moves particles by velocity * dt', () => {
    const ps = new ParticleSystem()
    ps.emit(100, 200, 1, { ...BASE_CONFIG, speedMin: 10, speedMax: 10, lifeMin: 1, lifeMax: 1 })
    const before = { ...ps.getParticles()[0] }
    ps.update(0.1)
    const after = ps.getParticles()[0]
    expect(after.x).toBeCloseTo(before.x + before.vx * 0.1, 5)
    expect(after.y).toBeCloseTo(before.y + before.vy * 0.1, 5)
  })

  it('reduces particle lifetime by dt', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 1, { ...BASE_CONFIG, lifeMin: 0.5, lifeMax: 0.5 })
    ps.update(0.1)
    expect(ps.getParticles()[0].lifetime).toBeCloseTo(0.4, 5)
  })

  it('updates alpha as lifetime / maxLifetime', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 1, { ...BASE_CONFIG, lifeMin: 1, lifeMax: 1 })
    ps.update(0.5)
    const p = ps.getParticles()[0]
    expect(p.alpha).toBeCloseTo(p.lifetime / p.maxLifetime, 5)
  })

  it('removes particles when lifetime reaches zero', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 3, { ...BASE_CONFIG, lifeMin: 0.1, lifeMax: 0.1 })
    ps.update(0.2)
    expect(ps.getParticles()).toHaveLength(0)
  })

  it('keeps particles that still have lifetime remaining', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 5, { ...BASE_CONFIG, lifeMin: 1, lifeMax: 1 })
    ps.update(0.3)
    expect(ps.getParticles()).toHaveLength(5)
  })

  it('applies gravity to vy each update', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 1, { ...BASE_CONFIG, gravity: 50, speedMin: 0, speedMax: 0, lifeMin: 1, lifeMax: 1 })
    const vyBefore = ps.getParticles()[0].vy
    ps.update(0.1)
    expect(ps.getParticles()[0].vy).toBeCloseTo(vyBefore + 50 * 0.1, 5)
  })

  it('does not apply gravity when gravity is 0', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 1, { ...BASE_CONFIG, gravity: 0, speedMin: 0, speedMax: 0, lifeMin: 1, lifeMax: 1 })
    const vyBefore = ps.getParticles()[0].vy
    ps.update(0.1)
    expect(ps.getParticles()[0].vy).toBeCloseTo(vyBefore, 5)
  })

  it('does nothing with zero dt', () => {
    const ps = new ParticleSystem()
    ps.emit(50, 50, 3, { ...BASE_CONFIG, lifeMin: 0.5, lifeMax: 0.5 })
    const before = ps.getParticles().map((p) => ({ ...p }))
    ps.update(0)
    const after = ps.getParticles()
    expect(after).toHaveLength(3)
    for (let i = 0; i < 3; i++) {
      expect(after[i].x).toBeCloseTo(before[i].x, 5)
      expect(after[i].y).toBeCloseTo(before[i].y, 5)
    }
  })
})

describe('ParticleSystem.clear()', () => {
  it('empties the particles array', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 10, BASE_CONFIG)
    ps.clear()
    expect(ps.getParticles()).toHaveLength(0)
  })

  it('is idempotent on an already-empty system', () => {
    const ps = new ParticleSystem()
    expect(() => ps.clear()).not.toThrow()
    expect(ps.getParticles()).toHaveLength(0)
  })
})

describe('ParticleSystem.setEnabled()', () => {
  it('does not add particles when disabled', () => {
    const ps = new ParticleSystem()
    ps.setEnabled(false)
    ps.emit(0, 0, 10, BASE_CONFIG)
    expect(ps.getParticles()).toHaveLength(0)
  })

  it('adds particles when enabled (default)', () => {
    const ps = new ParticleSystem()
    ps.emit(0, 0, 5, BASE_CONFIG)
    expect(ps.getParticles()).toHaveLength(5)
  })

  it('resumes adding particles after re-enabling', () => {
    const ps = new ParticleSystem()
    ps.setEnabled(false)
    ps.emit(0, 0, 5, BASE_CONFIG)
    ps.setEnabled(true)
    ps.emit(0, 0, 3, BASE_CONFIG)
    expect(ps.getParticles()).toHaveLength(3)
  })
})

describe('EAT_CONFIG', () => {
  it('has no gravity (eat burst floats freely)', () => {
    expect(EAT_CONFIG.gravity ?? 0).toBe(0)
  })

  it('speed range covers 2–5', () => {
    expect(EAT_CONFIG.speedMin).toBe(2)
    expect(EAT_CONFIG.speedMax).toBe(5)
  })

  it('life range is within 0.4–0.8s', () => {
    expect(EAT_CONFIG.lifeMin).toBeGreaterThanOrEqual(0.4)
    expect(EAT_CONFIG.lifeMax).toBeLessThanOrEqual(0.8)
  })

  it('radius range is within 2–4', () => {
    expect(EAT_CONFIG.radiusMin).toBeGreaterThanOrEqual(2)
    expect(EAT_CONFIG.radiusMax).toBeLessThanOrEqual(4)
  })
})

describe('DEATH_CONFIG', () => {
  it('has gravity enabled for falling effect', () => {
    expect(DEATH_CONFIG.gravity).toBeGreaterThan(0)
  })

  it('life range is within 0.6–1.2s', () => {
    expect(DEATH_CONFIG.lifeMin).toBeGreaterThanOrEqual(0.6)
    expect(DEATH_CONFIG.lifeMax).toBeLessThanOrEqual(1.2)
  })

  it('radius range is within 2–6', () => {
    expect(DEATH_CONFIG.radiusMin).toBeGreaterThanOrEqual(2)
    expect(DEATH_CONFIG.radiusMax).toBeLessThanOrEqual(6)
  })
})
