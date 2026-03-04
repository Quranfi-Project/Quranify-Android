import { Routes, Route, Navigate } from 'react-router-dom'
import ClientLayout from './components/ClientLayout'
import SurahList from './components/SurahList'
import SurahDetail from './components/SurahDetail'
import ReadingMode from './components/ReadingMode'
import ReadRedirect from './components/ReadRedirect'
import Bookmarks from './components/Bookmarks'
import DuaList from './components/DuaList'
import About from './components/About'
import Contact from './components/Contact'
import Roadmap from './components/Roadmap'
import AdminRoadmap from './components/AdminRoadmap'
import Privacy from './components/Privacy'
import Terms from './components/Terms'

export default function App() {
  return (
    <ClientLayout>
      <Routes>
        <Route path="/" element={<SurahList />} />
        <Route path="/surah/:surahNumber" element={<SurahDetail />} />
        <Route path="/read" element={<ReadRedirect />} />
        <Route path="/read/:pageNumber" element={<ReadingMode />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/dua" element={<DuaList />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/admin" element={<AdminRoadmap />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClientLayout>
  )
}
