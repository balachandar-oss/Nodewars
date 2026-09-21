import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const user = await res.json();
          setIsAdmin(user.role === 'ADMIN');
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [token]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ color: 'var(--text-secondary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `var(--accent-blue) transparent var(--accent-blue) var(--accent-blue)` }}></div>
          <p className="font-mono uppercase tracking-widest">VERIFYING ACCESS...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
