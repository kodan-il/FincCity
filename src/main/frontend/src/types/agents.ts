// types/agent.ts
export interface StockHistory {
  iteration: number;
  stock_name: string;
  stock_type: string;
  outcome: number;
  points_after: number;
}

export interface AgentTrait {
  Agent_name: string;
  economic_level: 'low' | 'middle' | 'upper-middle';
  literacy_level: 'low' | 'medium' | 'high';
  fomo_level: 'low' | 'medium' | 'high';
  tendency: 'risk-averse' | 'neutral' | 'risk-seeking';
  personality: 'impulsive' | 'analytical' | 'herd-follower' | 'contrarian';
  financial_points: number;
  current_asset_allocation: string;
  is_bankrupt: boolean;
  stock_history: StockHistory[];
}