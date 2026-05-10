import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import VideoDetail from './pages/VideoDetail.jsx'
import MyChannel from './pages/MyChannel.jsx'
import Layout from './pages/Layout.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/video/:videoId' element={<VideoDetail />} />
        <Route path='/c/:username' element={<MyChannel />} />
      </Route>
      {/* Auth pages without layout */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
    </Routes>
  )
}

export default App;