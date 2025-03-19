import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Ticket as Cricket, LogOut } from 'lucide-react';
import Teams from './components/Teams';
import Players from './components/Players';
import Auction from './components/Auction';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import { useAuthStore } from './store/authStore';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-indigo-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Cricket className="h-8 w-8" />
                <span className="text-xl font-bold">IPL Auction</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/teams" className="hover:text-indigo-200 px-3 py-2">Teams</Link>
                <Link to="/players" className="hover:text-indigo-200 px-3 py-2">Players</Link>
                {isAuthenticated && (
                  <Link to="/auction" className="hover:text-indigo-200 px-3 py-2">Auction</Link>
                )}
                <Link to="/leaderboard" className="hover:text-indigo-200 px-3 py-2">Leaderboard</Link>
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 hover:text-indigo-200 px-3 py-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="hover:text-indigo-200 px-3 py-2"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/teams" element={<Teams isAdmin={isAuthenticated} />} />
            <Route path="/players" element={<Players isAdmin={isAuthenticated} />} />
            <Route
              path="/auction"
              element={
                <ProtectedRoute>
                  <Auction />
                </ProtectedRoute>
              }
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/" element={<Navigate to="/teams" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;