import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { AlertCircle, ArrowUp, Check, ChevronUp } from 'lucide-react';

export default function Auction() {
  const { players, teams, assignPlayerToTeam, loadInitialData } = useAuctionStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bidIncrement, setBidIncrement] = useState<number>(100000); // Default increment: 1 Lakh

  // Common bid increments
  const quickIncrements = [50000, 100000, 500000, 1000000];

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const unsoldPlayers = players.filter(p => p.status === 'unsold');
  const currentPlayer = players.find(p => p.id === selectedPlayer);

  // Organize players by type
  const bowlers = unsoldPlayers.filter(p => p.type === 'Bowler');
  const batsmen = unsoldPlayers.filter(p => p.type === 'Batsman');
  const allRounders = unsoldPlayers.filter(p => p.type === 'All-rounder');

  const handleSell = async () => {
    if (!selectedPlayer || !selectedTeam || bidAmount <= 0) {
      setError('Please select a player, team, and enter a valid bid amount');
      return;
    }

    const team = teams.find(t => t.id === selectedTeam);
    if (!team) {
      setError('Selected team not found');
      return;
    }

    if (bidAmount > team.purseRemaining) {
      setError(`Team ${team.name} doesn't have enough funds (Remaining: ₹${team.purseRemaining.toLocaleString()})`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await assignPlayerToTeam(selectedPlayer, selectedTeam, bidAmount);
      setSelectedPlayer(null);
      setSelectedTeam('');
      setBidAmount(0);
    } catch (err) {
      setError('Failed to sell player. Please try again.');
      console.error('Error selling player:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseBid = (amount: number) => {
    setBidAmount(prev => prev + amount);
    setError(null);
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setError(null);
  };

  // Player card component for reuse
  const PlayerCard = ({ player }) => (
    <div
      key={player.id}
      onClick={() => {
        setSelectedPlayer(player.id);
        setBidAmount(player.basePrice);
        setError(null);
      }}
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        selectedPlayer === player.id
          ? 'border-indigo-500 bg-indigo-50'
          : 'hover:border-gray-300'
      }`}
    >
      <h3 className="font-semibold">{player.name}</h3>
      <p className="text-sm text-gray-600">{player.type}</p>
      <p className="text-sm text-gray-600">Base Price: ₹{player.basePrice.toLocaleString()}</p>
      <p className="text-sm text-gray-600">Rating: {player.rating}/10</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Available Players</h2>
        
        {/* Players organized in three columns by type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Bowlers */}
          <div>
            <h3 className="font-bold text-lg pb-2 mb-2 border-b text-center">Bowlers ({bowlers.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {bowlers.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
              {bowlers.length === 0 && (
                <p className="text-gray-500 text-center py-2 text-sm italic">No bowlers available</p>
              )}
            </div>
          </div>
          
          {/* Column 2: Batsmen */}
          <div>
            <h3 className="font-bold text-lg pb-2 mb-2 border-b text-center">Batsmen ({batsmen.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {batsmen.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
              {batsmen.length === 0 && (
                <p className="text-gray-500 text-center py-2 text-sm italic">No batsmen available</p>
              )}
            </div>
          </div>
          
          {/* Column 3: All-rounders */}
          <div>
            <h3 className="font-bold text-lg pb-2 mb-2 border-b text-center">All-rounders ({allRounders.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {allRounders.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
              {allRounders.length === 0 && (
                <p className="text-gray-500 text-center py-2 text-sm italic">No all-rounders available</p>
              )}
            </div>
          </div>
        </div>
        
        {unsoldPlayers.length === 0 && (
          <p className="text-gray-500 text-center py-4 mt-4">No unsold players available</p>
        )}
      </div>

      {selectedPlayer && currentPlayer && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Auction Control</h2>
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-700">{currentPlayer.name}</h3>
              <p className="text-indigo-600">{currentPlayer.type}</p>
              <div className="flex justify-between mt-2">
                <p className="text-indigo-600">Base Price: ₹{currentPlayer.basePrice.toLocaleString()}</p>
                <p className="text-indigo-600">Rating: {currentPlayer.rating}/10</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Bid</label>
                <div className="relative">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(Number(e.target.value));
                      setError(null);
                    }}
                    min={currentPlayer.basePrice}
                    className="w-full px-4 py-2 border rounded-md text-xl font-semibold"
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bid Increment</label>
                <div className="flex space-x-2">
                  {quickIncrements.map(increment => (
                    <button
                      key={increment}
                      onClick={() => handleIncreaseBid(increment)}
                      className="flex-1 bg-gray-100 px-2 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      +{(increment / 100000).toFixed(increment % 100000 === 0 ? 0 : 1)}L
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Team Selection</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamChange(team.id)}
                    disabled={loading || team.purseRemaining < bidAmount}
                    className={`p-2 rounded-md flex flex-col items-center text-center transition-colors ${
                      selectedTeam === team.id
                        ? 'bg-indigo-600 text-white'
                        : team.purseRemaining < bidAmount
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <span className="font-semibold truncate w-full">{team.name}</span>
                    <span className="text-xs truncate w-full">
                      {selectedTeam === team.id && <Check className="h-3 w-3 inline" />} 
                      ₹{team.purseRemaining.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => handleIncreaseBid(bidIncrement)}
                disabled={loading}
                className="flex-1 bg-indigo-100 text-indigo-800 px-6 py-3 rounded-md hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ChevronUp className="h-5 w-5" />
                Increase Bid
              </button>
              
              <button
                onClick={handleSell}
                disabled={loading || !selectedTeam || bidAmount < currentPlayer.basePrice}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Selling...' : 'Sell Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}