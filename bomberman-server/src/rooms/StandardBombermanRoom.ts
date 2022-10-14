import { Room, Client } from "colyseus";
import { StandardBombermanRoomState } from "./schema/StandardBombermanRoomState";

export class StandardBombermanRoom extends Room<StandardBombermanRoomState> {

  onCreate (options: any) {
    this.setState(new StandardBombermanRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
