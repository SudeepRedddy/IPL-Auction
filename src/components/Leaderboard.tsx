import React from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { Trophy, Users, DollarSign, Star, Award } from 'lucide-react';

export default function Leaderboard() {
  const { teams, players } = useAuctionStore();
  
  // Transform teams data to include average rating and other metrics
  const teamsWithMetrics = teams.map(team => {
    // Calculate average rating if team has players, otherwise 0
    const avgRating = team.players.length > 0 
      ? Number((team.totalRating / team.players.length).toFixed(1))
      : 0;
    
    // Calculate other metrics
    const totalPlayers = team.players.length;
    const averagePurchase = totalPlayers > 0 
      ? Math.round(team.totalPurchase / totalPlayers) 
      : 0;
    
    // Count player types
    const playerTypes = {
      Batsman: team.players.filter(p => p.type === 'Batsman').length,
      Bowler: team.players.filter(p => p.type === 'Bowler').length,
      AllRounder: team.players.filter(p => p.type === 'All-rounder').length,
    };
    
    // Find highest rated player
    const highestRatedPlayer = team.players.length > 0 
      ? team.players.reduce((prev, current) => 
          (prev.rating > current.rating) ? prev : current
        ) 
      : null;
    
    // Find highest purchase
    const highestPurchase = team.players.length > 0 
      ? team.players.reduce((prev, current) => 
          ((current.soldPrice || 0) > (prev.soldPrice || 0)) ? current : prev
        ) 
      : null;
    
    return {
      ...team,
      averageRating: avgRating,
      totalPlayers,
      averagePurchase,
      playerTypes,
      highestRatedPlayer,
      highestPurchase,
      spendPercentage: Math.round(((team.purseGiven - team.purseRemaining) / team.purseGiven) * 100)
    };
  });
  
  // Sort by highest average rating
  const sortedTeams = [...teamsWithMetrics].sort((a, b) => b.averageRating - a.averageRating);
  
  // Total number of sold players
  const soldPlayersCount = players.filter(p => p.status === 'sold').length;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-indigo-700 to-indigo-500 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Auction Leaderboard</h2>
              <p className="text-xs text-indigo-100">Based on team ratings</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-indigo-100 text-xs">Players Sold</div>
            <div className="text-lg font-bold">{soldPlayersCount}/{players.length}</div>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`mb-2 rounded border ${
              index === 0 ? 'border-yellow-400' : 'border-gray-200'
            }`}
          >
            <div className={`p-2 ${index === 0 ? 'bg-yellow-50' : 'bg-white'}`}>
              <div className="flex items-center">
                {/* Rank */}
                <div className={`flex-none w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-800' : 
                  index === 1 ? 'bg-gray-300 text-gray-700' : 
                  index === 2 ? 'bg-amber-600 text-amber-100' : 
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {index + 1}
                </div>
                
                {/* Team name and rating */}
                <div className="ml-2 flex-none w-48">
                  <h3 className="font-bold text-sm">{team.name}</h3>
                  <div className="flex items-center text-xs text-gray-600">
                    {/* <Star className="h-3 w-12 text-yellow-500 mr-1" /> */}
                    <span>Rating: <strong>{team.averageRating.toFixed(1)}</strong></span>
                  </div>
                </div>
                
                {/* Squad composition */}
                <div className="flex items-center text-xs mr-4">
                  <Users className="h-3 w-12 text-indigo-500 mr-1" />
                  <div>
                    <div className="text-gray-500">Squad</div>
                    <div>B:{team.playerTypes.Batsman} • BL:{team.playerTypes.Bowler} • AR:{team.playerTypes.AllRounder}</div>
                  </div>
                </div>
                
                {/* Star player */}
                <div className="flex items-center text-xs mr-4">
                  <Award className="h-3 w-12 text-indigo-500 mr-1" />
                  <div>
                    <div className="text-gray-500">Star Player</div>
                    <div className="truncate max-w-32">
                      {team.highestRatedPlayer ? (
                        <span>{team.highestRatedPlayer.name}</span>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Highest purchase */}
                <div className="flex items-center text-xs mr-4">
                  <DollarSign className="h-3 w-15 text-indigo-500 mr-1" />
                  <div>
                    <div className="text-gray-500">Top Buy</div>
                    <div className="truncate max-w-32">
                      {team.highestPurchase ? (
                        <span>
                          {team.highestPurchase.name} (₹{(team.highestPurchase.soldPrice || 0).toLocaleString()})
                        </span>
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Purse */}
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500">Purse</div>
                  <div className="font-semibold text-sm">
                    ₹{team.purseRemaining.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {team.spendPercentage}% spent
                  </div>
                </div>
              </div>
              
              {/* Visual indicator of purse spent */}
              <div className="mt-1 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    team.spendPercentage > 90 ? 'bg-red-500' : 
                    team.spendPercentage > 70 ? 'bg-orange-500' : 
                    'bg-green-500'
                  }`} 
                  style={{ width: `${team.spendPercentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        
        {teams.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No teams available. Add teams to see the leaderboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}