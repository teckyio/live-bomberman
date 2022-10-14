import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "arena.config.ts" file here.
import appConfig from "../src/arena.config";
import { StandardBombermanRoomState } from "../src/rooms/schema/StandardBombermanRoomState";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

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
});
