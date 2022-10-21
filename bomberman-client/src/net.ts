import * as Colyseus from 'colyseus.js'
import { Room } from 'colyseus.js'
import { Direction } from './data'
import { Game } from './main'
import { convertBlocksToWorld, convertNetPlayersToPlayers } from './utils'

let client = new Colyseus.Client('ws://localhost:2567')
let room: Colyseus.Room

// Lobby logic

document.querySelector('#lobby form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  client
    .joinById(e.currentTarget['room-id']?.value)
    .then(_room => {
      initRoom(_room)
    })
    .catch(err => {
      console.log('failed to join room:', err)
    })
})

document.querySelector('#lobby button#create')?.addEventListener('click', (e) => {
  e.preventDefault();
  client
    .create('standard_bomberman_room')
    .then(_room => {
      initRoom(_room);
    })
});

document.querySelector('#start')?.addEventListener('click', (e) => {
  e.preventDefault();
  startRoom();
});

function startRoom() {
  room.send('start')
}

let game: ReturnType<typeof Game> | null = null;

function initRoom(_room: Room) {
  room = _room
  document.body.dataset.currentScreen = 'room'
  document.querySelector('#room-id')!.innerHTML = room.id 

  room.onStateChange(state => {
    if (room.state.host === room.sessionId) {
      document.querySelector('#start')!.style.display = 'block';
    } else {
      document.querySelector('#start')!.style.display = 'none';
    }

    if (room.state.started) {
      document.body.dataset.currentScreen = 'game'
      if (game == null) {
        game = Game(document.querySelector('#main')!, 
          convertBlocksToWorld(room.state.blocks),
          convertNetPlayersToPlayers(room.state.playerOrder.map((id: string) => room.state.players[id])),
        );
      } else {
        game.updateWorld(
          convertBlocksToWorld(room.state.blocks)
        )
        game.updatePlayers(
          convertNetPlayersToPlayers(room.state.playerOrder.map((id: string) => room.state.players[id]))
        );
      }
    } else {
      document.body.dataset.currentScreen = 'room'
      game?.stop();
    }
  })
  room.onMessage('dev', message => {
    console.log('room', room.name, 'received message', message)
  })
  room.onError((code, message) => {
    console.log('room', room.name, 'error:', code, message)
  })
  room.onLeave(code => {
    console.log('room', room.name, 'leave:', code)
  })
}

export function emitMove(direction: Direction) {
  room.send('move', direction)
}

export function emitBomb() {
  room.send('bomb')
}
