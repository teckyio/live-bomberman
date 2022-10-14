import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";
import sinon from "sinon";
import FakeTimers from "@sinonjs/fake-timers";

// import your "arena.config.ts" file here.
import appConfig from "../src/arena.config";
import { PlayerDirection, StandardBombermanRoomState } from "../src/rooms/schema/StandardBombermanRoomState";



async function move(client: any, direction: PlayerDirection) {
  for (let i = 0; i < 10; i++) {
    await client.send("move", direction);
  }
}

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;
  let sandbox: sinon.SinonSandbox;

  before(async () => {
    colyseus = await boot(appConfig)

  });
  after(async () => {
    colyseus.shutdown()
  });

  beforeEach(async () => {
    await colyseus.cleanup()
    sandbox = sinon.createSandbox();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it("connecting into a room will have one player", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);

    // make your assertions
    assert.strictEqual(client1.sessionId, room.clients[0].sessionId);
    assert.strictEqual(client2.sessionId, room.clients[1].sessionId);

    // wait for state sync
    await room.waitForNextPatch();

    assert.equal(2, client1.state.players.size);
  });

  it("connecting into a room will have one player who is the host and another one will be the guest", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);

    // wait for state sync
    await room.waitForNextPatch();

    // make your assertions
    assert.equal(client1.sessionId, client1.state.host);
    assert.equal(client1.sessionId, client2.state.host);
  });

  it("if host left, the guest become the host", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);

    await client1.leave(true);

    // wait for state sync
    await room.waitForNextPatch();

    // make your assertions
    assert.equal(1, client2.state.players.size);
    assert.equal(client2.sessionId, client2.state.host);
  });

  it("if all player left, the host become empty", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);

    await client1.leave(true);
    await client2.leave(true);

    // make your assertions
    assert.equal('', room.state.host);
  });

  it("if host starts the game, the game will start", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);
    await client1.send("start");

    // wait for state sync
    await room.waitForNextPatch();

    // make your assertions
    assert.equal(true, room.state.started);
  });

  it("if guest starts the game, the game will NOT start", async () => {
    // `room` is the server-side Room instance reference.
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);
    await client2.send("start");

    // wait for state sync
    await room.waitForNextPatch();

    // make your assertions
    assert.equal(false, room.state.started);
  });

  it("when the start game, the blocks are generated", async () => {
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");

    await room.waitForNextPatch();

    assert.equal(13 * 11, room.state.blocks.length);
  });

  it("when the start game, the blocks near the player are not generated", async () => {
    sandbox.stub(Math, 'random').returns(1);
    
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");

    await room.waitForNextPatch();

    assert.equal(13 * 11, room.state.blocks.length);
    assert.equal('empty', room.state.blocks.at(0).type);
    assert.equal('empty', room.state.blocks.at(1).type);
    assert.equal('wall', room.state.blocks.at(2).type);
    assert.equal('empty', room.state.blocks.at(13).type);
    assert.equal('wall', room.state.blocks.at(13 * 2).type);
  });

  it("when the start game, the four players will stand in four corners", async () => {
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    const client2 = await colyseus.connectTo(room);
    const client3 = await colyseus.connectTo(room);
    const client4 = await colyseus.connectTo(room);
    await client1.send("start");

    await room.waitForNextPatch();

    assert.equal(0, room.state.players.get(room.state.playerOrder.at(0))!.x);
    assert.equal(0, room.state.players.get(room.state.playerOrder.at(0))!.y);

    assert.equal(130 - 10, room.state.players.get(room.state.playerOrder.at(1))!.x);
    assert.equal(110 - 10, room.state.players.get(room.state.playerOrder.at(1))!.y);

    assert.equal(0, room.state.players.get(room.state.playerOrder.at(2))!.x);
    assert.equal(110 - 10, room.state.players.get(room.state.playerOrder.at(2))!.y);

    assert.equal(130 - 10, room.state.players.get(room.state.playerOrder.at(3))!.x);
    assert.equal(0, room.state.players.get(room.state.playerOrder.at(3))!.y);
  });

  it("the player should move not beyond the boundary", async () => {
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await move(client1, PlayerDirection.UP);
    await room.waitForNextPatch();

    assert.equal(0, room.state.players.get(room.state.playerOrder.at(0))!.x);
    assert.equal(0, room.state.players.get(room.state.playerOrder.at(0))!.y);
  });
  
  it("the player should move one block down", async () => {
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await move(client1, PlayerDirection.DOWN);
    await room.waitForNextPatch();

    assert.equal(0, room.state.players.get(room.state.playerOrder.at(0))!.x);
    assert.equal(10, room.state.players.get(room.state.playerOrder.at(0))!.y);
  });
  
  it("the player should not move towards block", async () => {
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await move(client1, PlayerDirection.DOWN);
    await move(client1, PlayerDirection.RIGHT);
    await room.waitForNextPatch();

    assert.equal(0, room.state.players.get(room.state.playerOrder.at(0))!.x);
    assert.equal(10, room.state.players.get(room.state.playerOrder.at(0))!.y);
  });
  
  it("the player move down twice", async () => {
    sandbox.stub(Math, 'random').returns(0);

    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await move(client1, PlayerDirection.DOWN);
    await move(client1, PlayerDirection.DOWN);
    await room.waitForNextPatch();

    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.x, 0);
    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.y, 20);
  });
  
  
  it("the player move down left right down right and block by wall", async () => {
    const stub = sandbox.stub(Math, 'random')
    stub.onCall(13 * 2).returns(0);
    stub.returns(1);


    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await move(client1, PlayerDirection.DOWN);
    await move(client1, PlayerDirection.LEFT);
    await move(client1, PlayerDirection.RIGHT);
    await move(client1, PlayerDirection.DOWN);
    await move(client1, PlayerDirection.RIGHT);
    await room.waitForNextPatch();

    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.x, 0);
    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.y, 20);
  });
  
  it("the player move down left right down right and not block by wall", async () => {
    sandbox.stub(Math, 'random').returns(0);

    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await move(client1, PlayerDirection.DOWN);
    await move(client1, PlayerDirection.LEFT);
    await move(client1, PlayerDirection.RIGHT);
    await move(client1, PlayerDirection.DOWN);
    await move(client1, PlayerDirection.RIGHT);
    await room.waitForNextPatch();

    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.x, 10);
    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.y, 20);
  });
  
  it("the player (0,0) place a bomb at 0,0", async () => {
    const room = await colyseus.createRoom<StandardBombermanRoomState>("standard_bomberman_room", {});
    room.setSimulationInterval((deltaTime) => {});

    const client1 = await colyseus.connectTo(room);
    await client1.send("start");
    await client1.send("bomb");

    await room.waitForNextSimulationTick();

    assert.equal(room.state.players.get(room.state.playerOrder.at(0))!.dead, true);
  });
  
});
