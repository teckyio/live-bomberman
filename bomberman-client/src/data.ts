import { emitMove } from './net'

const { round } = Math

let fakeInterval = 3 * 1000

// y -> x -> Cell
export type World = Cell[][]

// export type Cell = Player | Box | Stone | Space
export type Cell = {
  x: number
  y: number
  box?: boolean
  stone?: boolean
  bomb?: number // bomb time
  fire?: number // expire time
}

export type Player = {
  type: 'player'
  color: string
  direction: Direction
  id: number
  self?: boolean
  x: number
  y: number
}

export type Box = {
  type: 'box'
}

export type Stone = {
  type: 'stone'
}

export type Space = {
  type: 'space'
}

export enum Direction {
  up,
  down,
  left,
  right,
}

export let world: World = []
export let players: Player[] = []
export let bombs = new Set<Cell>()
export let fires = new Set<Cell>()

export let X = 15
export let Y = 13

for (let y = 0; y < Y; y++) {
  world[y] = []
  for (let x = 0; x < X; x++) {
    world[y][x] = { x, y }
  }
}

for (let y = 0; y < Y; y++) {
  // draw left line
  world[y][0].stone = true
  // draw right line
  world[y][X - 1].stone = true
}

for (let x = 0; x < X; x++) {
  // draw up line
  world[0][x].stone = true
  // draw down line
  world[Y - 1][x].stone = true
}

world[0 + 2][0 + 2].stone = true
world[1 + 2][1 + 2].box = true
players.push({
  type: 'player',
  color: 'red',
  direction: Direction.up,
  id: 1,
  x: 2 + 2,
  y: 2 + 2,
})
players.push({
  type: 'player',
  color: 'green',
  direction: Direction.down,
  id: 1,
  x: 3 + 2,
  y: 3 + 2,
})
players.push({
  type: 'player',
  color: 'lightgreen',
  direction: Direction.left,
  id: 1,
  x: 4 + 2,
  y: 4 + 2,
})
players.push({
  type: 'player',
  color: 'yellow',
  direction: Direction.right,
  id: 1,
  x: 5 + 2,
  y: 5 + 2,
})
players.push({
  type: 'player',
  color: 'red',
  direction: Direction.up,
  id: 1,
  self: true,
  x: 3 + 2,
  y: 2 + 2,
})
players.push({
  type: 'player',
  color: 'green',
  direction: Direction.down,
  id: 1,
  self: true,
  x: 4 + 2,
  y: 3 + 2,
})
players.push({
  type: 'player',
  color: 'lightgreen',
  direction: Direction.left,
  id: 1,
  self: true,
  x: 5 + 2,
  y: 4 + 2,
})
players.push({
  type: 'player',
  color: 'yellow',
  direction: Direction.right,
  id: 1,
  self: true,
  x: 6 + 2,
  y: 5 + 2,
})
world[6 + 2][6 + 2].fire = Date.now() + fakeInterval

placeBomb(7 + 2, 7 + 2, Date.now() + fakeInterval)

let selfPlayer: Player

for (let player of players) {
  if (player.self) {
    selfPlayer = player
    break
  }
}

export let moveX = 0
export let moveY = 0

export function setMoveX(value: number) {
  moveX = value
}
export function setMoveY(value: number) {
  moveY = value
}

export function moveSelfPlayer() {
  let x = selfPlayer.x + moveX * 0.1
  let y = selfPlayer.y + moveY * 0.1

  // check stone collision
  if (world[round(y)]?.[round(x)]?.stone) {
    return
  }

  selfPlayer.x = x
  selfPlayer.y = y

  // emit to server
  if (moveX < 0) {
    emitMove(Direction.left)
  } else if (moveX > 0) {
    emitMove(Direction.right)
  }

  if (moveY < 0) {
    emitMove(Direction.up)
  } else {
    emitMove(Direction.down)
  }
}

export function setSelfPlayerDirection(direction: Direction) {
  selfPlayer.direction = direction
  // todo emit to server
}

export function selfPlaceBomb() {
  // todo emit to server
  let x = round(selfPlayer.x)
  let y = round(selfPlayer.y)
  placeBomb(x, y, Date.now() + fakeInterval)
}

export function placeBomb(x: number, y: number, bombTime: number) {
  let cell = world[y]?.[x]
  if (!cell) return
  if (cell.stone) return
  cell.bomb = bombTime
  bombs.add(cell)
}

export function placeFire(x: number, y: number, expireTime: number) {
  let cell = world[y]?.[x]
  if (!cell) return
  if (cell.stone) return
  delete cell.box
  cell.fire = expireTime
  fires.add(cell)
}

export function checkBombFire(now: number) {
  for (let cell of bombs) {
    if (cell.bomb! <= now) {
      delete cell.bomb
      bombs.delete(cell)
      placeFire(cell.x, cell.y, Date.now() + fakeInterval)

      placeFire(cell.x, cell.y - 1, Date.now() + fakeInterval)
      placeFire(cell.x, cell.y - 2, Date.now() + fakeInterval)

      placeFire(cell.x, cell.y + 1, Date.now() + fakeInterval)
      placeFire(cell.x, cell.y + 2, Date.now() + fakeInterval)

      placeFire(cell.x - 1, cell.y, Date.now() + fakeInterval)
      placeFire(cell.x - 2, cell.y, Date.now() + fakeInterval)

      placeFire(cell.x + 1, cell.y, Date.now() + fakeInterval)
      placeFire(cell.x + 2, cell.y, Date.now() + fakeInterval)
    }
  }
  for (let cell of fires) {
    if (cell.fire! <= now) {
      delete cell.fire
      fires.delete(cell)
    }
  }
}
