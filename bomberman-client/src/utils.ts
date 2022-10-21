import { Cell, Player, world, World } from "./data";

export function convertNetPlayersToPlayers(players: Player[]) {
  return players.map((player) => {
    return {
      ...player,
      x: player.x/10,
      y: player.y/10
    };
  });
}

export function convertBlocksToWorld(blocks: {
  type: 'empty' | 'stone' | 'wall';
  item: 'empty' | 'bomb' | 'powerup-bomb';
  bombTime: number;
  bombStrength: number;
}[]): World {
  let X = 13
  let Y = 11
  let world: World = []
  
  for (let y = 0; y < Y; y++) {
    world[y] = []
    for (let x = 0; x < X; x++) {
      world[y][x] = convertBlockToCell(blocks[y * X + x])
    }
  }
  
  return world;
}

export function convertBlockToCell(block: {
  type: 'empty' | 'stone' | 'wall';
  item: 'empty' | 'bomb' | 'powerup-bomb';
  bombTime: number;
  bombStrength: number;
}): Cell {
  if (block.item === 'bomb') {
    return { bomb: block.bombTime };
  }
  switch (block.type) {
    case 'empty':
      return {  };
    case 'stone':
      return { stone: true };
    case 'wall':
      return { box: true }
  }
}
