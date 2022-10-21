import {
  // checkBombFire,
  Direction,
  moveSelfPlayer,
  placeBomb,
  Player,
  selfPlaceBomb,
  setMoveX,
  setMoveY,
  setSelfPlayerDirection,
  World,
  X,
  Y,
} from './data'
import { AssetImage } from './image'

export function Game(canvas: HTMLCanvasElement, initWorld: World, initPlayers: Player[]) {
  let world = initWorld;
  let players = initPlayers;

  const { random, floor, min, max, sqrt, pow, exp, E, log } = Math
  
  const R = 0
  const G = 1
  const B = 2
  const A = 3
  
  const boxSize = 28
  
  // const rect = canvas.getBoundingClientRect()
  
  const w = X * boxSize
  const h = Y * boxSize
  const n = w * h
  
  canvas.width = w
  canvas.height = h
  
  const context = canvas.getContext('2d')!
  const len = w * h * 4
  
  let boxImage = new AssetImage('box.png')
  let stoneImage = new AssetImage('stone.png')
  let fireImage = new AssetImage('fire.png')
  let bombImage = new AssetImage('bomb.png')
  
  let playerDownImage = new AssetImage('player-down.png')
  let playerLeftImage = new AssetImage('player-left.png')
  let playerUpImage = new AssetImage('player-up.png')
  let playerRightImage = new AssetImage('player-right.png')
  
  let playerSelfDownImage = new AssetImage('player-self-down.png')
  let playerSelfLeftImage = new AssetImage('player-self-left.png')
  let playerSelfUpImage = new AssetImage('player-self-up.png')
  let playerSelfRightImage = new AssetImage('player-self-right.png')
  
  function getPlayerImage(player: Player) {
    if (player.self) {
      switch (player.direction) {
        case Direction.down:
          return playerSelfDownImage
        case Direction.left:
          return playerSelfLeftImage
        case Direction.up:
          return playerSelfUpImage
        case Direction.right:
          return playerSelfRightImage
      }
    }
    switch (player.direction) {
      case Direction.down:
        return playerDownImage
      case Direction.left:
        return playerLeftImage
      case Direction.up:
        return playerUpImage
      case Direction.right:
        return playerRightImage
    }
  }
  
  function drawMap() {
    context.fillStyle = 'lightgreen'
    context.fillRect(0, 0, w, h)
    for (let y = 0; y < Y; y++) {
      for (let x = 0; x < X; x++) {
        let left = x * boxSize
        let top = y * boxSize
        let cell = world[y][x]
        if (cell.stone) {
          context.drawImage(stoneImage, left, top, boxSize, boxSize)
        }
        if (cell.box) {
          context.drawImage(boxImage, left, top, boxSize, boxSize)
        }
        if (cell.bomb) {
          context.drawImage(bombImage, left, top, boxSize, boxSize)
        }
        if (cell.fire) {
          context.drawImage(fireImage, left, top, boxSize, boxSize)
        }
      }
    }
    for (let player of players) {
      let left = player.x * boxSize
      let top = player.y * boxSize
      let image = getPlayerImage(player)
      context.drawImage(image, left, top, boxSize, boxSize)
    }
  }
  
  let playerX = 0
  let playerY = 0
  
  window.addEventListener('keyup', event => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'ArrowDown':
      case 's':
        setMoveY(0)
        break
      case 'ArrowLeft':
      case 'a':
      case 'ArrowRight':
      case 'd':
        setMoveX(0)
        break
    }
  })
  window.addEventListener('keydown', event => {
    switch (event.key) {
      case ' ':
        selfPlaceBomb()
        break
      case 'ArrowUp':
      case 'w':
        setMoveY(-1)
        setSelfPlayerDirection(Direction.up)
        break
      case 'ArrowDown':
      case 's':
        setMoveY(+1)
        setSelfPlayerDirection(Direction.down)
        break
      case 'ArrowLeft':
      case 'a':
        setMoveX(-1)
        setSelfPlayerDirection(Direction.left)
        break
      case 'ArrowRight':
      case 'd':
        setMoveX(+1)
        setSelfPlayerDirection(Direction.right)
        break
    }
  })
  
  function tick() {
    // update logic
    moveSelfPlayer()
    // checkBombFire(Date.now())
  }
  
  // const batch = sqrt(w * h)
  const batch = 1
  let timer = requestAnimationFrame(loop)
  
  function loop() {
    for (let i = 0; i < batch; i++) {
      tick()
    }
    drawMap()
    timer = requestAnimationFrame(loop)
  }

  function stop() {
    cancelAnimationFrame(timer)
  }
  
  return {
    canvas,
    context,
    loop,
    stop,
    w,
    h,
    n,
    len,
    updateWorld: (newWorld: World) => {
      world = newWorld
    },
    updatePlayers: (newPlayers: Player[]) => {
      players = newPlayers
    }
  }; 
}