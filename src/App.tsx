import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Ticket as Cricket, LogOut, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-indigo-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo - visible on all screens */}
              <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <Cricket className="h-8 w-8" />
                <span className="text-xl font-bold">IPL Auction</span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/teams" className="hover:text-indigo-200 px-3 py-2 transition duration-150">Teams</Link>
                <Link to="/players" className="hover:text-indigo-200 px-3 py-2 transition duration-150">Players</Link>
                {isAuthenticated && (
                  <Link to="/auction" className="hover:text-indigo-200 px-3 py-2 transition duration-150">Auction</Link>
                )}
                <Link to="/leaderboard" className="hover:text-indigo-200 px-3 py-2 transition duration-150">Leaderboard</Link>
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 hover:text-indigo-200 px-3 py-2 transition duration-150"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="hover:text-indigo-200 px-3 py-2 transition duration-150"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="text-white focus:outline-none"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-indigo-700 px-2 pt-2 pb-4 space-y-1">
              <Link 
                to="/teams" 
                className="block px-3 py-2 rounded hover:bg-indigo-800 transition duration-150"
                onClick={closeMobileMenu}
              >
                Teams
              </Link>
              <Link 
                to="/players" 
                className="block px-3 py-2 rounded hover:bg-indigo-800 transition duration-150"
                onClick={closeMobileMenu}
              >
                Players
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/auction" 
                  className="block px-3 py-2 rounded hover:bg-indigo-800 transition duration-150"
                  onClick={closeMobileMenu}
                >
                  Auction
                </Link>
              )}
              <Link 
                to="/leaderboard" 
                className="block px-3 py-2 rounded hover:bg-indigo-800 transition duration-150"
                onClick={closeMobileMenu}
              >
                Leaderboard
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded hover:bg-indigo-800 transition duration-150"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded hover:bg-indigo-800 transition duration-150"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </div>
          )}
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