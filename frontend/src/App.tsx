import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import BoardPage from './features/cases/BoardPage'
import CaseDetailPage from './features/cases/CaseDetailPage'
import CasesPage from './features/cases/CasesPage'
import DashboardPage from './features/dashboard/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}