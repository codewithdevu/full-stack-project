import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import VideoDetail from './pages/VideoDetail.jsx'

function App() {
  return (
    <Routes>
    <Route path='/register' element={<Register />}/>
    <Route path='/login' element={<Login />}/>
    <Route path='/dashboard' element={<Dashboard/>}/>
    <Route path='/' element={<Home/>}/>
    <Route path='/video/:videoId' element={<VideoDetail/>}/>
    </Routes>
  )
}
``
export default App