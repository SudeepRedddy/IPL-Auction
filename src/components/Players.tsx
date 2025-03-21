import React, { useState, useEffect, useRef } from 'react';
import { useAuctionStore } from '../store/auctionStore';
import { Search, PlusCircle, Upload } from 'lucide-react';
import Papa from 'papaparse';

interface PlayersProps {
  isAdmin: boolean;
}

export default function Players({ isAdmin }: PlayersProps) {
  const { players, addPlayer, addPlayers, loadInitialData } = useAuctionStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Bowler' | 'Batsman' | 'All-rounder'>('all');
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    type: 'Bowler' as const,
    basePrice: 0,
    rating: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const players = results.data.map((row: any) => ({
            name: row.name,
            type: row.type as 'Bowler' | 'Batsman' | 'All-rounder',
            basePrice: parseInt(row.basePrice),
            rating: parseInt(row.rating)
          }));

          // Validate the data
          const invalidPlayers = players.filter(
            p => !p.name || !p.type || isNaN(p.basePrice) || isNaN(p.rating)
          );

          if (invalidPlayers.length > 0) {
            setUploadError('Invalid data in CSV file. Please check the format.');
            return;
          }

          await addPlayers(players);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          setUploadError('Error processing CSV file');
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setUploadError('Error parsing CSV file');
        setUploading(false);
      }
    });
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || player.type === filter;
    return matchesSearch && matchesFilter;
  });

  const organizePlayers = () => {
    const bowlersUnsold = filteredPlayers.filter(player => player.type === 'Bowler' && player.status === 'unsold');
    const bowlersSold = filteredPlayers.filter(player => player.type === 'Bowler' && player.status === 'sold');
    
    const batsmenUnsold = filteredPlayers.filter(player => player.type === 'Batsman' && player.status === 'unsold');
    const batsmenSold = filteredPlayers.filter(player => player.type === 'Batsman' && player.status === 'sold');
    
    const allRoundersUnsold = filteredPlayers.filter(player => player.type === 'All-rounder' && player.status === 'unsold');
    const allRoundersSold = filteredPlayers.filter(player => player.type === 'All-rounder' && player.status === 'sold');

    return { 
      bowlersUnsold, bowlersSold, 
      batsmenUnsold, batsmenSold, 
      allRoundersUnsold, allRoundersSold 
    };
  };

  const { 
    bowlersUnsold, bowlersSold, 
    batsmenUnsold, batsmenSold, 
    allRoundersUnsold, allRoundersSold 
  } = organizePlayers();

  const PlayerCard = ({ player }) => (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{player.name}</h3>
          <p className="text-sm text-gray-600">{player.type}</p>
          <p className="text-sm text-gray-600">Base Price: ₹{player.basePrice.toLocaleString()}</p>
          {player.status === 'sold' && player.soldPrice && (
            <p className="text-sm text-green-600 font-medium">
              Sold for: ₹{player.soldPrice.toLocaleString()}
            </p>
          )}
          <p className="text-sm text-gray-600">Rating: {player.rating}/100</p>
        </div>
        <div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            player.status === 'unsold' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {player.status}
          </span>
        </div>
      </div>
    </div>
  );

  const PlayerTypeSection = ({ title, players }) => (
    <div className="mt-4">
      <h4 className="text-md font-medium mb-2">
        {title} ({players.length})
      </h4>
      <div className="space-y-4">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
        {players.length === 0 && (
          <p className="text-gray-500 text-sm italic">No players in this category</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isAdmin && (
        <>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add New Player</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
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
                className="w-full sm:w-48 px-4 py-2 border rounded-md"
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
                className="w-full sm:w-48 px-4 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Rating (1-100)"
                value={newPlayer.rating || ''}
                onChange={(e) => setNewPlayer({ ...newPlayer, rating: Number(e.target.value) })}
                className="w-full sm:w-48 px-4 py-2 border rounded-md"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Add Player
              </button>
            </form>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Import Players from CSV</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">
                  Upload a CSV file with columns: name, type, basePrice, rating
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 border-dashed cursor-pointer transition-colors ${
                      uploading
                        ? 'bg-gray-100 border-gray-300'
                        : 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    <Upload className="h-5 w-5 text-indigo-600" />
                    <span className="text-indigo-600 font-medium">
                      {uploading ? 'Uploading...' : 'Choose CSV File'}
                    </span>
                  </label>
                </div>
                {uploadError && (
                  <p className="text-red-600 text-sm">{uploadError}</p>
                )}
              </div>
              {/* <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">CSV Format Example:</p>
                <pre className="bg-gray-50 p-2 rounded">
                  name,type,basePrice,rating{'\n'}
                  "Virat Kohli",Batsman,200000,9{'\n'}
                  "Jasprit Bumrah",Bowler,180000,8{'\n'}
                  "Hardik Pandya",All-rounder,150000,7
                </pre>
              </div> */}
            </div>
          </div>
        </>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            className="w-full sm:w-48 px-4 py-2 border rounded-md"
          >
            <option value="all">All Types</option>
            <option value="Bowler">Bowlers</option>
            <option value="Batsman">Batsmen</option>
            <option value="All-rounder">All-rounders</option>
          </select>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b bg-yellow-100 px-4 py-2 rounded-md">UNSOLD PLAYERS</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg text-center pb-2 border-b">Bowlers</h3>
              <PlayerTypeSection title="Unsold" players={bowlersUnsold} />
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-center pb-2 border-b">Batsmen</h3>
              <PlayerTypeSection title="Unsold" players={batsmenUnsold} />
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-center pb-2 border-b">All-rounders</h3>
              <PlayerTypeSection title="Unsold" players={allRoundersUnsold} />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b bg-green-100 px-4 py-2 rounded-md">SOLD PLAYERS</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg text-center pb-2 border-b">Bowlers</h3>
              <PlayerTypeSection title="Sold" players={bowlersSold} />
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-center pb-2 border-b">Batsmen</h3>
              <PlayerTypeSection title="Sold" players={batsmenSold} />
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-center pb-2 border-b">All-rounders</h3>
              <PlayerTypeSection title="Sold" players={allRoundersSold} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}