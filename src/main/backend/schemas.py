from pydantic import BaseModel
from typing import Literal, Optional

# -- This is Class Object to store all data type and details of each objects.

# -- Market condition
MARKET_CONDITIONS = Literal["bull_market", "bear_market", "normal"]
class MarketCondition(BaseModel):
    condition: MARKET_CONDITIONS
    description: str #for context

# -- Stocks Object
class Stocks(BaseModel):
    Stock_Name: str
    Stock_Type: Literal["high_volatile", "stable"]
    description: str #for context

# -- Report for each iteration
class IterationReport(BaseModel):
    Iteration_Count: int
    Iteration_Month: int
    market_condition: str
    agents_profits: list[str]
    agents_loss: list[str]
    agents_bankrupt: list[str]
    avg_financial_points: float

#-- Class Object to store history all stocks bought
class StockHistory(BaseModel):
    iteration: int
    stock_name: str
    stock_type: str
    outcome: int
    points_after: int

class FeaturedStock(BaseModel):
    stock:Stocks
    todays_trend:Literal["bull","bear"]

# -- Agent object
class AgentProfile(BaseModel):
    Agent_name: str
    economic_level: Literal["low", "middle", "upper-middle"]
    literacy_level: Literal["low", "medium", "high"]
    fomo_level: Literal["low", "medium", "high"]
    tendency: Literal["risk-averse", "neutral", "risk-seeking"]
    personality: Literal["impulsive", "analytical", "herd-follower", "contrarian"]

    financial_points: int = 10
    current_asset_allocation: str = ""
    is_bankrupt: bool = False
    stock_history: list[StockHistory] = []