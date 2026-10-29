import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './auth'
import { Layout } from './components/Layout'
import { Loading } from './components/States'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { NotFound } from './pages/NotFound'
import { ProfilePage } from './pages/ProfilePage'
import { ProjectFormPage } from './pages/ProjectFormPage'
import { ProjectPage } from './pages/ProjectPage'
import { RegisterPage } from './pages/RegisterPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <Loading label="Checking your session" />
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<FeedPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="projects/new"
              element={
                <RequireAuth>
                  <ProjectFormPage />
                </RequireAuth>
              }
            />
            <Route path="projects/:id" element={<ProjectPage />} />
            <Route
              path="projects/:id/edit"
              element={
                <RequireAuth>
                  <ProjectFormPage />
                </RequireAuth>
              }
            />
            <Route path="u/:username" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
