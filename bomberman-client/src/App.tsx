import React from 'react'
import logo from './logo.svg'
import './App.css'
import { BrowserRouter, Router } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'

function App() {
  return (
    <div className="App">
      13
      <Router children={AppRoutes()}></Router>
    </div>
  )
}

export default App
