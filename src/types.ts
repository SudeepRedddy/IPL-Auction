export type Player = {
  id: string;
  name: string;
  type: 'Bowler' | 'Batsman' | 'All-rounder';
  basePrice: number;
  soldPrice?: number;
  status: 'sold' | 'unsold';
  teamId?: string;
};

export type Team = {
  id: string;
  name: string;
  purseGiven: number;
  purseRemaining: number;
  currentPurchase: number;
  totalPurchase: number;
  players: Player[];
};