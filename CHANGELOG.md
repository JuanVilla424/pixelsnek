## [1.1.2] - 2026-03-04

### Features

- **core**: add responsive design mobile polish and github pages deployment (`minor candidate`)
- **core**: add responsive portrait/landscape canvas sizing and update docs
- **core**: add responsive design, mobile polish, pwa manifest, and github pages deploy
- **core**: add pwa manifest, icons, touch hint, haptic feedback, and mobile meta tags
- **core**: add settings panel with persistent configuration
- **core**: add hud, settings ui, particle toggle, and css settings panel
- **core**: add leaderboard system with name entry and localstorage persistence
- **core**: add theme system with os preference detection and toggle
- **core**: implement particle system with eat burst and death explosion effects
- **core**: pass snake segments to onDeath callback for particle explosion
- **core**: add particle system with eat burst and death explosion effects
- **core**: export ThemePreference type and DARK_THEME/LIGHT_THEME aliases, fix particle test fixtures
- **core**: implement theme system with dark/light/system modes and toggle button
- **core**: add GameSnapshot interface to types
- **core**: implement canvas 2d renderer with hiDPI support and game loop wiring
- **core**: add vitest test infrastructure and game unit tests
- **core**: add barrel export for game module
- **core**: add particle type to types.ts and remove stale gitkeep placeholders
- **core**: consolidate direction enum into types.ts with isOppositeDirection helper
- **core**: implement input manager with keyboard, touch, and direction buffering
- **core**: implement core game engine with snake, food, grid, level, and game state machine
- **core**: scaffold vite typescript project with canvas setup
- **core**: clean vite boilerplate and scaffold directory structure

### Bug Fixes

- **core**: harden localStorage parsing with unknown type and strip control chars from names (`patch candidate`)
- **core**: sanitize leaderboard entry at write time and validate date field (`patch candidate`)
- **core**: validate leaderboard entries shape and clamp name length on localStorage read (`patch candidate`)
- **core**: commit package-lock.json for reproducible ci builds

### Documentation

- **core**: update changelog
- **core**: add emoji headers to changelog and fix status badge link (`patch candidate`)

### Refactors

- **core**: pass particles directly to renderer, remove game.particles coupling

### Tests

- **core**: add portrait/landscape, touch hint, haptic, contextmenu tests; fix mobile css touch targets
- **core**: add settings, showgrid, showparticles, and controlscheme tests
- **core**: expand particle system and renderer test coverage
- **core**: add renderer unit tests for canvas context, resize, render, and particles
- **core**: add comprehensive unit tests for grid, snake, food, level, and game modules

### Chores

- **core**: add version-controller workflow, test step to ci, and live demo link (`patch candidate`)
- **core**: scaffold vite typescript project with canvas structure
- **core**: remove template artifacts, update workflows for vite typescript project

### Other Changes

- Initial commit
