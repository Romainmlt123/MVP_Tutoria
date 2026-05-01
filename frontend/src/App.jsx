import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Flashcards from './pages/Flashcards'
import FlashcardDeck from './pages/FlashcardDeck'
import FlashcardReview from './pages/FlashcardReview'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Voice from './pages/Voice'
import Explorer from './pages/Explorer'
import ExplorerPath from './pages/ExplorerPath'
import { getDefaultChapterId } from './data/curriculum'
import useProfileStore from './store/profileStore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'

const PUBLIC_AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']
const ONBOARDING_PATH = '/onboarding'

/** Ancienne URL /explorer/:subjectId (carte) → premier chapitre du programme. */
function ExplorerSubjectRedirect() {
  const { subjectId } = useParams()
  const grade = useProfileStore((s) => s.profile?.settings?.onboarding?.grade) || '2nde'
  const chapterId = getDefaultChapterId(subjectId, grade)
  if (!chapterId) return <Navigate to="/explorer" replace />
  return <Navigate to={`/explorer/${subjectId}/chapter/${chapterId}`} replace />
}

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { user, isLoading } = useAuthStore()
  const isAuthPage = PUBLIC_AUTH_PATHS.includes(location.pathname)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-display">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-text-secondary text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (supabase && !user && !isAuthPage) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (supabase && user && isAuthPage && location.pathname !== '/reset-password') {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <Routes>
      <Route path="/login" element={<ProtectedRoute><Login /></ProtectedRoute>} />
      <Route path="/signup" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ProtectedRoute><ForgotPassword /></ProtectedRoute>} />
      <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
      <Route path={ONBOARDING_PATH} element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/flashcards/deck/:deckId" element={<FlashcardDeck />} />
        <Route path="/flashcards/review" element={<FlashcardReview />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/explorer/:subjectId" element={<ExplorerSubjectRedirect />} />
        <Route path="/explorer/:subjectId/chapter/:chapterId" element={<ExplorerPath />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
