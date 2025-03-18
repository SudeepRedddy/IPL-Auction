import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { Search, PlusCircle } from 'lucide-react';

export default function Players() {
  const { players, addPlayer, loadInitialData } = useAuctionStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Bowler' | 'Batsman' | 'All-rounder'>('all');
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    type: 'Bowler' as const,
    basePrice: 0,
    rating: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayer.name && newPlayer.basePrice > 0 && newPlayer.rating > 0) {
      await addPlayer(newPlayer);
      setNewPlayer({ name: '', type: 'Bowler', basePrice: 0, rating: 0 });
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || player.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Player</h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Player Name"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <select
            value={newPlayer.type}
            onChange={(e) => setNewPlayer({ ...newPlayer, type: e.target.value as any })}
            className="w-48 px-4 py-2 border rounded-md"
          >
            <option value="Bowler">Bowler</option>
            <option value="Batsman">Batsman</option>
            <option value="All-rounder">All-rounder</option>
          </select>
          <input
            type="number"
            placeholder="Base Price"
            value={newPlayer.basePrice || ''}
            onChange={(e) => setNewPlayer({ ...newPlayer, basePrice: Number(e.target.value) })}
            className="w-48 px-4 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Rating (1-10)"
            value={newPlayer.rating || ''}
            onChange={(e) => setNewPlayer({ ...newPlayer, rating: Number(e.target.value) })}
            className="w-48 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Player
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-48 px-4 py-2 border rounded-md"
          >
            <option value="all">All Types</option>
            <option value="Bowler">Bowlers</option>
            <option value="Batsman">Batsmen</option>
            <option value="All-rounder">All-rounders</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map(player => (
            <div
              key={player.id}
              className="p-4 rounded-lg border bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <p className="text-sm text-gray-600">{player.type}</p>
                  <p className="text-sm text-gray-600">Base Price: ₹{player.basePrice.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Rating: {player.rating}/10</p>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800`}>
                    {player.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
