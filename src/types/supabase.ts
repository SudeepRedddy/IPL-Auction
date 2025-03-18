export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          purse_given: number;
          purse_remaining: number;
          current_purchase: number;
          total_purchase: number;
          total_rating: number;  // ✅ New field for total team rating
          players: Json[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          purse_given: number;
          purse_remaining: number;
          current_purchase?: number;
          total_purchase?: number;
          total_rating?: number;  // ✅ New field (default 0 if not provided)
          players?: Json[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          purse_given?: number;
          purse_remaining?: number;
          current_purchase?: number;
          total_purchase?: number;
          total_rating?: number;  // ✅ New field (optional for updates)
          players?: Json[];
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          name: string;
          type: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';  // ✅ Restricted types
          base_price: number;
          sold_price: number | null;
          status: 'sold' | 'unsold';  // ✅ Restricted to 'sold' or 'unsold'
          team_id: string | null;
          rating: number;  // ✅ New field for player rating
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
          base_price: number;
          sold_price?: number | null;
          status?: 'sold' | 'unsold';
          team_id?: string | null;
          rating: number;  // ✅ New field (mandatory for insertion)
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
          base_price?: number;
          sold_price?: number | null;
          status?: 'sold' | 'unsold';
          team_id?: string | null;
          rating?: number;  // ✅ New field (optional for updates)
          created_at?: string;
        };
      };
    };
  };
}
