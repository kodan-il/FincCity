from pydantic import BaseModel
from typing import Literal

class AgentProfile(BaseModel):
    name: str
    economic_level: Literal["low", "middle", "upper-middle"]
    literacy_level: Literal["low", "medium", "high"]
    fomo_level: Literal["low", "medium", "high"]
    tendency: Literal["risk-averse", "neutral", "risk-seeking"]
    personality: Literal["impulsive", "analytical", "herd-follower", "contrarian"]

    financialPoints: int = 10
    current_asset_allocation: Literal["safe_asset", "speculative_asset", "liquid"] = "liquid"
    is_bankrupt: bool = False
