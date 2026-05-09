
import { Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MatchPage from './pages/MatchPage'
import InstitutionsPage from './pages/InstitutionsPage'
import ProgramsPage from './pages/ProgramsPage'
import AboutPage from './pages/AboutPage'
import { useRoleView } from './context/RoleViewContext'

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { isLoggedIn, role } = useRoleView()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin' && role !== 'director') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    // Removed <BrowserRouter> from here
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/institutions" element={<InstitutionsPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}

export default App;

