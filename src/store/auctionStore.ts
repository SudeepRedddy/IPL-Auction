import { create } from 'zustand';
import { Player, Team } from '../types';
import { supabase } from '../lib/supabase';

interface AuctionStore {
  teams: Team[];
  players: Player[];
  addTeam: (team: Omit<Team, 'id' | 'players' | 'totalRating'>) => Promise<void>;
  addPlayer: (player: Omit<Player, 'id' | 'status' | 'teamId'>) => Promise<void>;
  assignPlayerToTeam: (playerId: string, teamId: string, soldPrice: number) => Promise<void>;
  loadInitialData: () => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  teams: [],
  players: [],

  loadInitialData: async () => {
    try {
      // Load teams and players in parallel
      const [{ data: teams }, { data: players }] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('players').select('*')
      ]);

      if (teams && players) {
        // Process players first
        const processedPlayers = players.map(player => ({
          id: player.id,
          name: player.name,
          type: player.type as 'Bowler' | 'Batsman' | 'All-rounder' | 'Wicketkeeper',
          basePrice: player.base_price,
          status: player.status as 'sold' | 'unsold',
          soldPrice: player.sold_price || undefined,
          teamId: player.team_id || undefined,
          rating: player.rating || 0
        }));

        // Map teams and add their players from the players array
        set({ 
          teams: teams.map(team => {
            // Find all players belonging to this team
            const teamPlayers = processedPlayers.filter(player => player.teamId === team.id);
            
            return {
              id: team.id,
              name: team.name,
              purseGiven: team.purse_given,
              purseRemaining: team.purse_remaining,
              currentPurchase: team.current_purchase || 0,
              totalPurchase: team.total_purchase || 0,
              totalRating: team.total_rating || 0,
              players: teamPlayers
            };
          }),
          players: processedPlayers
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  },

  addTeam: async (team) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          purse_given: team.purseGiven,
          purse_remaining: team.purseGiven,
          current_purchase: 0,
          total_purchase: 0,
          total_rating: 0,
          players: []
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTeam: Team = {
          id: data.id,
          name: data.name,
          purseGiven: data.purse_given,
          purseRemaining: data.purse_remaining,
          currentPurchase: data.current_purchase || 0,
          totalPurchase: data.total_purchase || 0,
          totalRating: data.total_rating || 0,
          players: []
        };

        set((state) => ({
          teams: [...state.teams, newTeam]
        }));
      }
    } catch (error) {
      console.error('Error adding team:', error);
    }
  },

  addPlayer: async (player) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          name: player.name,
          type: player.type,
          base_price: player.basePrice,
          status: 'unsold',
          rating: player.rating
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newPlayer: Player = {
          id: data.id,
          name: data.name,
          type: data.type as 'Bowler' | 'Batsman' | 'All-rounder' | 'Wicketkeeper',
          basePrice: data.base_price,
          status: 'unsold',
          rating: data.rating
        };

        set((state) => ({
          players: [...state.players, newPlayer]
        }));
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  },

  assignPlayerToTeam: async (playerId, teamId, soldPrice) => {
    try {
      const { data: team, error: teamError } = await supabase.from('teams').select('*').eq('id', teamId).single();
      if (teamError) throw teamError;

      const { data: player, error: playerError } = await supabase.from('players').select('*').eq('id', playerId).single();
      if (playerError) throw playerError;

      if (!team || !player) {
        console.error('Invalid team or player');
        return;
      }

      // Update the player in database
      const { error: updatePlayerError } = await supabase.from('players').update({
        status: 'sold',
        team_id: teamId,
        sold_price: soldPrice
      }).eq('id', playerId);
      if (updatePlayerError) throw updatePlayerError;

      // Calculate updated team values
      const updatedPurseRemaining = team.purse_remaining - soldPrice;
      // Add to current purchase instead of replacing it
      const updatedCurrentPurchase = team.current_purchase + soldPrice;
      const updatedTotalPurchase = team.total_purchase + soldPrice;
      const updatedTotalRating = team.total_rating + player.rating;

      // Update the team in database
      const { error: updateTeamError } = await supabase.from('teams').update({
        purse_remaining: updatedPurseRemaining,
        current_purchase: updatedCurrentPurchase,
        total_purchase: updatedTotalPurchase,
        total_rating: updatedTotalRating
      }).eq('id', teamId);
      if (updateTeamError) throw updateTeamError;

      // Update the state
      set((state) => {
        // Create updated player object
        const updatedPlayer = { 
          ...state.players.find(p => p.id === playerId)!, 
          status: 'sold', 
          teamId, 
          soldPrice 
        };
        
        return {
          // Update all players
          players: state.players.map(p => p.id === playerId ? updatedPlayer : p),
          
          // Update teams
          teams: state.teams.map(t => {
            if (t.id === teamId) {
              // For the team buying the player, add the player to its players array
              return { 
                ...t, 
                purseRemaining: updatedPurseRemaining, 
                currentPurchase: updatedCurrentPurchase,
                totalPurchase: updatedTotalPurchase, 
                totalRating: updatedTotalRating,
                players: [...t.players, updatedPlayer]
              };
            }
            return t;
          })
        };
      });
    } catch (error) {
      console.error('Error selling player:', error);
    }
  },

  removeTeam: async (teamId) => {
    try {
      // Delete the team from the database
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;

      // Update any players that belonged to this team
      await supabase
        .from('players')
        .update({ status: 'unsold', team_id: null, sold_price: null })
        .eq('team_id', teamId);

      // Update the local state
      set((state) => ({
        teams: state.teams.filter(team => team.id !== teamId),
        players: state.players.map(player => 
          player.teamId === teamId 
            ? { ...player, status: 'unsold', teamId: undefined, soldPrice: undefined } 
            : player
        )
      }));
    } catch (error) {
      console.error('Error removing team:', error);
    }
  }
}));