export type TradeType = 'Buy' | 'Sell';
export type TradeResult = 'Win' | 'Loss' | 'Break Even';

export interface Trade {
  id?: string;
  userId: string;
  pair: string;
  type: TradeType;
  entryTime: string;
  exitTime?: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  pips?: number;
  profit?: number;
  riskPercent?: number;
  result?: TradeResult;
  strategy?: string;
  emotionBefore?: string;
  emotionAfter?: string;
  notes?: string;
  screenshotUrl?: string;
  createdAt: string;
}

export interface AccountSettings {
  userId: string;
  startingBalance: number;
  currentBalance: number;
  equityGoal?: number;
  currency: string;
  updatedAt: string;
}

export interface DailyStats {
  date: string;
  pnl: number;
  tradesCount: number;
}
