export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export function isOpposite(a: Direction, b: Direction): boolean {
  return (
    (a === Direction.Up && b === Direction.Down) ||
    (a === Direction.Down && b === Direction.Up) ||
    (a === Direction.Left && b === Direction.Right) ||
    (a === Direction.Right && b === Direction.Left)
  )
}
