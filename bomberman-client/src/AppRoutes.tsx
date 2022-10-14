import { Route, Routes } from 'react-router'
import { GameRoomPage } from './pages/GameRoomPage'
import { LobbyPage } from './pages/LobbyPage'
import { HomePage } from './pages/HomePage'

export let AppRoutes = () => {
  return (
    <Routes>
      <Route path="/lobby" element={<LobbyPage />}></Route>
      <Route path="/room/:room_id" element={<GameRoomPage />}></Route>
      <Route element={<HomePage />}></Route>
    </Routes>
  )
}
