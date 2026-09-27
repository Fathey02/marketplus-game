export interface TradeOrder {
  id: string;
  playerId: string;
  type: 'BUY' | 'SELL';
  price: number;
  lotSize: number;
  openTime: number;
}

export interface Player {
  id: string;
  username: string;
  balance: number;
  equity: number;
  activeOrders: TradeOrder[];
}

export interface MarketTick {
  symbol: string;
  price: number;
  timestamp: number;
}