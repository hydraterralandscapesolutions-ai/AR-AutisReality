import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Resources from './pages/Resources'
import Games from './pages/Games'
import Rewards from './pages/Rewards'
import CalmCorner from './pages/CalmCorner'

function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/games" element={<Games />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/calm" element={<CalmCorner />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
