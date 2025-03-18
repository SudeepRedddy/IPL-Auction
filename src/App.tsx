import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Ticket as Cricket } from 'lucide-react';
import Teams from './components/Teams';
import Players from './components/Players';
import Auction from './components/Auction';
import Leaderboard from './components/Leaderboard';

function App() {
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
              <div className="flex space-x-4">
                <Link to="/teams" className="hover:text-indigo-200 px-3 py-2">Teams</Link>
                <Link to="/players" className="hover:text-indigo-200 px-3 py-2">Players</Link>
                <Link to="/auction" className="hover:text-indigo-200 px-3 py-2">Auction</Link>
                <Link to="/leaderboard" className="hover:text-indigo-200 px-3 py-2">Leaderboard</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Teams />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;