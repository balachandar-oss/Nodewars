import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lab from './pages/Lab';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import BugArchitect from './pages/BugArchitect';
import Hunt from './pages/Hunt';
import AdminCastle from './pages/AdminCastle';
import InstructorMode from './pages/InstructorMode';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab" element={<Navigate to="/dashboard" replace />} />
            <Route path="/lab/:missionId" element={<Lab />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/bug-architect" element={<BugArchitect />} />
            <Route path="/hunt" element={<Hunt />} />
            <Route path="/admin/castle" element={<AdminCastle />} />
            <Route path="/instructor" element={<InstructorMode />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
