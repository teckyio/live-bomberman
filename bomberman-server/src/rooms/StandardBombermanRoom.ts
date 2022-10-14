import { Room, Client } from "colyseus";
import { Block, Player, StandardBombermanRoomState } from "./schema/StandardBombermanRoomState";

const playerPositions = [
  [0, 0],   // player 1 position
  [-1, -1], // player 2 position
  [0, -1],  // player 3 position
  [-1, 0],  // player 4 position
];

const width = 13;
const height = 11;

export class StandardBombermanRoom extends Room<StandardBombermanRoomState> {  
  onCreate (options: any) {
    this.setState(new StandardBombermanRoomState());

    this.onMessage("start", (client) => {
      if (this.state.host !== client.sessionId) {
        return;
      }

      this.state.started = true;
      this.state.timeRemaining = 60 * 3; // 3mins
      this.generateBlocks();
      this.placePlayers();
      this.clock.start();
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

  private convertCoordinateToXY(i: number) {
    return [i % width, Math.floor(i / width)];
  }

  private convertXYToCoordinate(x: number, y: number) {
    return y * width + x;
  }

  private generateBlocks() {
    for (let i = 0; i < width * height; i++) {
      const [x, y] = this.convertCoordinateToXY(i);
      const block = new Block();
      if (x % 2 === 1 && y % 2 === 1) {
        block.type = 'stone';
      } else if (Math.random() > 0.3) {
        block.type = 'wall';
      }
      this.state.blocks.push(block);
    }
  }

  private placePlayers() {
    const playerCount = this.state.playerOrder.length;

    for (let i = 0; i < playerCount; i++) {
      const sessionId = this.state.playerOrder.at(i);
      const x = (playerPositions[i][0] + width) % width;
      const y = (playerPositions[i][1] + height) % height;
      this.state.players.get(sessionId).x = x
      this.state.players.get(sessionId).y = y

      // the surrounded block should be removed
      const surroundings = [
        [0, 0],
        [0, -1],
        [-1, 0],
        [1, 0],
        [0, 1],
      ]
      for (const surrounding of surroundings) {
        const nX = x + surrounding[0]
        const nY = y + surrounding[1]

        if (nX < 0 || nX >= width || nY < 0 || nY >= height) {
          continue;
        }

        const coordinate = this.convertXYToCoordinate(nX, nY);
        this.state.blocks.at(coordinate).type = 'empty';
      }
    }
  }
}
