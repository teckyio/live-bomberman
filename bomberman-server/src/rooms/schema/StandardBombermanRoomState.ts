import { Schema, ArraySchema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

class Block extends Schema {
  @type("number") type: 'empty' | 'stone' | 'wall';
  @type("boolean") item: 'bomb' | 'powerup-bomb' | null;
}

export class StandardBombermanRoomState extends Schema {
  @type([ Block ]) blocks = new ArraySchema<Block>();
  @type([ Player ]) players = new ArraySchema<Player>();
  @type("number") timeRemaining: number;
}
