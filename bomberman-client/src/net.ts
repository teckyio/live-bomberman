import * as Colyseus from 'colyseus.js'
import { Room } from 'colyseus.js'
import { Direction } from './data'

export let client = new Colyseus.Client('ws://localhost:2567')

export let room: Colyseus.Room

client
  .joinOrCreate('demo-room')
  .then(_room => {
    room = _room
    console.log('joined room:', {
      session_id: room.sessionId,
      name: room.name,
    })
    initRoom(room)
  })
  .catch(err => {
    console.log('failed to join room:', err)
  })

function initRoom(room: Room) {
  room.onStateChange(state => {
    console.log(room.name, 'has new state:', state)
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
