import { Schema, Context, type } from "@colyseus/schema";

export class StandardBombermanRoomState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";

}
