import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";

export enum PlayerDirection {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

export class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") direction: PlayerDirection = PlayerDirection.DOWN;
}

export class Block extends Schema {
  @type("number") type: 'empty' | 'stone' | 'wall' = 'empty';
  @type("string") item: 'empty' | 'bomb' | 'powerup-bomb' = 'empty';
}

export class StandardBombermanRoomState extends Schema {
  @type([ Block ]) blocks = new ArraySchema<Block>();
  @type([ "string" ]) playerOrder = new ArraySchema<string>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") timeRemaining: number;
  @type("boolean") started: boolean = false;
  @type("string") host: string = '';
}
