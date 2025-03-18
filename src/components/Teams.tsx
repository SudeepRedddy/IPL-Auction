import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { PlusCircle, Trash2, Eye } from 'lucide-react';

export default function Teams() {
  const { teams, addTeam, removeTeam, loadInitialData } = useAuctionStore();
  const [newTeam, setNewTeam] = useState({ name: '', purseGiven: 0 });
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Add useEffect to load initial data when component mounts
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeam.name && newTeam.purseGiven > 0) {
      addTeam({
        name: newTeam.name,
        purseGiven: newTeam.purseGiven,
        purseRemaining: newTeam.purseGiven,
        currentPurchase: 0,
        totalPurchase: 0,
      });
      setNewTeam({ name: '', purseGiven: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Team</h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Team Name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Purse Amount"
            value={newTeam.purseGiven || ''}
            onChange={(e) => setNewTeam({ ...newTeam, purseGiven: Number(e.target.value) })}
            className="w-48 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Team
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purse Given</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purse Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Purchase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="px-6 py-4 whitespace-nowrap">{team.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{team.purseGiven.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{team.purseRemaining.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{team.currentPurchase.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{team.totalPurchase.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => removeTeam(team.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTeam && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">
            {teams.find(t => t.id === selectedTeam)?.name}'s Players
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams
              .find(t => t.id === selectedTeam)
              ?.players.map(player => (
                <div key={player.id} className="p-4 border rounded-md">
                  <h4 className="font-semibold">{player.name}</h4>
                  <p className="text-sm text-gray-600">{player.type}</p>
                  <p className="text-sm text-gray-600">Sold for: ₹{player.soldPrice?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Rating: {player.rating}/10</p>
                </div>
              ))}
            {(teams.find(t => t.id === selectedTeam)?.players.length === 0) && (
              <p className="col-span-3 text-gray-500 text-center py-4">No players in this team yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}