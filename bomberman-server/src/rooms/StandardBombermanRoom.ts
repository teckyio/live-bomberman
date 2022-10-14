import { Room, Client } from "colyseus";
import { Player, StandardBombermanRoomState } from "./schema/StandardBombermanRoomState";

export class StandardBombermanRoom extends Room<StandardBombermanRoomState> {

  onCreate (options: any) {
    this.setState(new StandardBombermanRoomState());

    this.onMessage("start", (client) => {
      if (this.state.host !== client.sessionId) {
        return;
      }

      this.state.started = true;
    });

  }

  onJoin (client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player())
    this.state.playerOrder.push(client.sessionId)

    if (this.state.host === '') {
      this.state.host = client.sessionId
    }
  }

  async onLeave (client: Client, consented: boolean) {
    try {
      if (consented) {
        throw new Error("Consented leave");
      }

      await this.allowReconnection(client, 10);
    } catch (e) {
      if (this.state.players.has(client.sessionId)) {
        this.state.players.delete(client.sessionId);
      }

      const index = this.state.playerOrder.indexOf(client.sessionId);
      if (index > -1) {
        this.state.playerOrder.splice(index, 1);
      }

      if (this.state.host === client.sessionId) {
        this.state.host = this.state.playerOrder.at(0) || ''
      }
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
