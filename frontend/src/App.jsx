import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Flashcards from './pages/Flashcards'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Voice from './pages/Voice'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
      <Route path="/settings" element={<Settings />} />
      <Route element={<MainLayout />}>
        <Route path="/voice" element={<Voice />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
