import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lab from './pages/Lab';
import Showcase from './pages/Showcase';
import Quiz from './pages/Quiz';
import AdminCastle from './pages/AdminCastle';
import InstructorMode from './pages/InstructorMode';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab" element={<Navigate to="/dashboard" replace />} />
            <Route path="/lab/:missionId" element={<Lab />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/admin/castle" element={<AdminCastle />} />
            <Route path="/instructor" element={<InstructorMode />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
